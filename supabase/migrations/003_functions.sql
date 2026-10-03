-- Geschäftslogik als Funktionen (laufen in der Datenbank, nicht im Browser)

-- Menge hinzufügen/ändern: bucht die Differenz auf die Beiträge der angemeldeten Person (Mitarbeiterinnen ändern sich nicht gegenseitig die Mengen weg)
create or replace function menge_setzen(p_bestellung bigint, p_produkt bigint, p_verwendung text, p_neu integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_pos bigint; v_alt integer; v_diff integer; v_rest integer; r record; v_status text;
begin
  if not is_mitarbeiter() then raise exception 'nicht angemeldet'; end if;
  select status into v_status from bestellung where id = p_bestellung;
  if v_status is distinct from 'offen' and not is_inhaber() then raise exception 'Bestellung ist abgeschlossen'; end if;
  insert into position (bestellung_id, produkt_id, verwendung, menge_bezahlt) values (p_bestellung, p_produkt, p_verwendung, 0)
    on conflict (bestellung_id, produkt_id, verwendung) do nothing;
  select id, menge_bezahlt into v_pos, v_alt from position where bestellung_id = p_bestellung and produkt_id = p_produkt and verwendung = p_verwendung for update;
  v_diff := p_neu - v_alt;
  if p_neu <= 0 then delete from position where id = v_pos; return; end if;
  update position set menge_bezahlt = p_neu where id = v_pos;
  if v_diff > 0 then
    insert into beitrag (position_id, profile_id, menge) values (v_pos, auth.uid(), v_diff)
      on conflict (position_id, profile_id) do update set menge = beitrag.menge + excluded.menge;
  elsif v_diff < 0 then
    v_rest := -v_diff;   -- zuerst die eigene Menge abziehen, dann die der anderen
    for r in select profile_id, menge from beitrag where position_id = v_pos order by (profile_id = auth.uid()) desc loop
      exit when v_rest <= 0;
      update beitrag set menge = menge - least(r.menge, v_rest) where position_id = v_pos and profile_id = r.profile_id;
      v_rest := v_rest - least(r.menge, v_rest);
    end loop;
    delete from beitrag where position_id = v_pos and menge <= 0;
  end if;
end $$;

-- Bestellung abschließen (nur Inhaberin): Nummer vergeben, EK-Preise festhalten, Gratisware nach Aktion berechnen
create or replace function bestellung_abschliessen(p_bestellung bigint)
returns text language plpgsql security definer set search_path = public as $$
declare v_nummer text; v_h text; v_satz numeric;
begin
  if not is_inhaber() then raise exception 'nur die Inhaberin darf abschließen'; end if;
  select hersteller into v_h from bestellung where id = p_bestellung and status = 'offen' for update;
  if v_h is null then raise exception 'Bestellung nicht gefunden oder schon abgeschlossen'; end if;
  select wkz_satz into v_satz from hersteller where name = v_h;
  v_nummer := 'BL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('bestellnummer_seq')::text, 6, '0');
  -- EK-Preis festhalten (Tester: −20 %)
  update position p set ek_einzel = round(pp.ek * case when p.verwendung = 'tester' then 0.8 else 1 end, 2)
    from produkt_preis pp where pp.produkt_id = p.produkt_id and p.bestellung_id = p_bestellung;
  update wkz_position w set ek_einzel = round(pp.ek * case when w.verwendung = 'tester' then 0.8 else 1 end, 2)
    from produkt_preis pp where pp.produkt_id = w.produkt_id and w.bestellung_id = p_bestellung;
  -- Gratismenge nach Aktion (z. B. '6+1' → je 6 bezahlt 1 gratis; '10+2' → je 10 bezahlt 2 gratis); nur Verkaufsware
  update position p set menge_gratis = (p.menge_bezahlt / a.bezahlt) * a.gratis
    from aktion a where a.hersteller = v_h and a.name = p.aktion and p.verwendung = 'sale' and p.bestellung_id = p_bestellung;
  update bestellung set status = 'abgeschlossen', nummer = v_nummer, wkz_satz = v_satz,
    abgeschlossen_von = auth.uid(), abgeschlossen_am = now() where id = p_bestellung;
  insert into protokoll (profile_id, aktion, details) values (auth.uid(), 'bestellung_abgeschlossen', jsonb_build_object('bestellung', p_bestellung, 'nummer', v_nummer));
  return v_nummer;
end $$;

-- Summen mit Preisen (nur Inhaberin; Mitarbeiterinnen bekommen eine Fehlermeldung)
create or replace function bestellung_summe(p_bestellung bigint)
returns table (bestellwert numeric, tester_rabatt numeric, gratis_wert numeric, wkz_basis numeric, wkz_guthaben numeric, wkz_gewaehlt numeric)
language plpgsql security definer set search_path = public as $$
declare v_satz numeric; v_h text;
begin
  if not is_inhaber() then raise exception 'keine Berechtigung'; end if;
  select b.hersteller, coalesce(b.wkz_satz, h.wkz_satz) into v_h, v_satz from bestellung b join hersteller h on h.name = b.hersteller where b.id = p_bestellung;
  return query
  select
    coalesce(sum(p.menge_bezahlt * coalesce(p.ek_einzel, pp.ek * case when p.verwendung = 'tester' then 0.8 else 1 end)), 0),
    coalesce(sum(case when p.verwendung = 'tester' then p.menge_bezahlt * pp.ek * 0.2 else 0 end), 0),
    coalesce(sum(p.menge_gratis * pp.ek), 0),
    coalesce(sum(case when p.aktion = 'none' then p.menge_bezahlt * coalesce(p.ek_einzel, pp.ek * case when p.verwendung = 'tester' then 0.8 else 1 end) else 0 end), 0),
    round(coalesce(sum(case when p.aktion = 'none' then p.menge_bezahlt * coalesce(p.ek_einzel, pp.ek * case when p.verwendung = 'tester' then 0.8 else 1 end) else 0 end), 0) * coalesce(v_satz,0) / 100, 2),
    (select coalesce(sum(w.menge * coalesce(w.ek_einzel, pw.ek * case when w.verwendung = 'tester' then 0.8 else 1 end)), 0) from wkz_position w join produkt_preis pw on pw.produkt_id = w.produkt_id where w.bestellung_id = p_bestellung)
  from position p join produkt_preis pp on pp.produkt_id = p.produkt_id where p.bestellung_id = p_bestellung;
end $$;

grant execute on function menge_setzen(bigint, bigint, text, integer) to authenticated;
grant execute on function bestellung_abschliessen(bigint) to authenticated;
grant execute on function bestellung_summe(bigint) to authenticated;
