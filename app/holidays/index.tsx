import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { colors, spacing, borderRadius, typography } from '../../constants';
import { useDraftAlarmStore } from '../../stores';
import { TopNav, PageTitle, Entry, Card, SectionTitle } from '../../components/ui';

interface Holiday {
  date: string;
  name: string;
}

interface HolidayCalendar {
  id: string;
  name: string;
  country: string;
  flag: string;
}

export const holidayCalendars: HolidayCalendar[] = [
  { id: 'us', name: 'US Holidays', country: 'US', flag: '🇺🇸' },
  { id: 'uk', name: 'UK Bank Holidays', country: 'GB', flag: '🇬🇧' },
  { id: 'ca', name: 'Canada Holidays', country: 'CA', flag: '🇨🇦' },
  { id: 'au', name: 'Australia Holidays', country: 'AU', flag: '🇦🇺' },
  { id: 'de', name: 'Germany Holidays', country: 'DE', flag: '🇩🇪' },
  { id: 'fr', name: 'France Holidays', country: 'FR', flag: '🇫🇷' },
  { id: 'jp', name: 'Japan Holidays', country: 'JP', flag: '🇯🇵' },
  { id: 'cn', name: 'China Holidays', country: 'CN', flag: '🇨🇳' },
  { id: 'in', name: 'India Holidays', country: 'IN', flag: '🇮🇳' },
  { id: 'br', name: 'Brazil Holidays', country: 'BR', flag: '🇧🇷' },
  { id: 'mx', name: 'Mexico Holidays', country: 'MX', flag: '🇲🇽' },
  { id: 'es', name: 'Spain Holidays', country: 'ES', flag: '🇪🇸' },
  { id: 'it', name: 'Italy Holidays', country: 'IT', flag: '🇮🇹' },
  { id: 'kr', name: 'South Korea Holidays', country: 'KR', flag: '🇰🇷' },
];

export const holidaysByCalendarAndYear: Record<string, Record<number, Holiday[]>> = {
  us: {
    2025: [
      { date: '2025-01-01', name: "New Year's Day" },
      { date: '2025-01-20', name: 'Martin Luther King Jr. Day' },
      { date: '2025-02-17', name: "Presidents' Day" },
      { date: '2025-05-26', name: 'Memorial Day' },
      { date: '2025-06-19', name: 'Juneteenth' },
      { date: '2025-07-04', name: 'Independence Day' },
      { date: '2025-09-01', name: 'Labor Day' },
      { date: '2025-10-13', name: 'Columbus Day' },
      { date: '2025-11-11', name: 'Veterans Day' },
      { date: '2025-11-27', name: 'Thanksgiving Day' },
      { date: '2025-12-25', name: 'Christmas Day' },
    ],
    2026: [
      { date: '2026-01-01', name: "New Year's Day" },
      { date: '2026-01-19', name: 'Martin Luther King Jr. Day' },
      { date: '2026-02-16', name: "Presidents' Day" },
      { date: '2026-05-25', name: 'Memorial Day' },
      { date: '2026-06-19', name: 'Juneteenth' },
      { date: '2026-07-04', name: 'Independence Day' },
      { date: '2026-09-07', name: 'Labor Day' },
      { date: '2026-10-12', name: 'Columbus Day' },
      { date: '2026-11-11', name: 'Veterans Day' },
      { date: '2026-11-26', name: 'Thanksgiving Day' },
      { date: '2026-12-25', name: 'Christmas Day' },
    ],
    2027: [
      { date: '2027-01-01', name: "New Year's Day" },
      { date: '2027-01-18', name: 'Martin Luther King Jr. Day' },
      { date: '2027-02-15', name: "Presidents' Day" },
      { date: '2027-05-31', name: 'Memorial Day' },
      { date: '2027-06-19', name: 'Juneteenth' },
      { date: '2027-07-04', name: 'Independence Day' },
      { date: '2027-09-06', name: 'Labor Day' },
      { date: '2027-10-11', name: 'Columbus Day' },
      { date: '2027-11-11', name: 'Veterans Day' },
      { date: '2027-11-25', name: 'Thanksgiving Day' },
      { date: '2027-12-25', name: 'Christmas Day' },
    ],
  },
  uk: {
    2025: [
      { date: '2025-01-01', name: "New Year's Day" },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-21', name: 'Easter Monday' },
      { date: '2025-05-05', name: 'Early May Bank Holiday' },
      { date: '2025-05-26', name: 'Spring Bank Holiday' },
      { date: '2025-08-25', name: 'Summer Bank Holiday' },
      { date: '2025-12-25', name: 'Christmas Day' },
      { date: '2025-12-26', name: 'Boxing Day' },
    ],
    2026: [
      { date: '2026-01-01', name: "New Year's Day" },
      { date: '2026-04-03', name: 'Good Friday' },
      { date: '2026-04-06', name: 'Easter Monday' },
      { date: '2026-05-04', name: 'Early May Bank Holiday' },
      { date: '2026-05-25', name: 'Spring Bank Holiday' },
      { date: '2026-08-31', name: 'Summer Bank Holiday' },
      { date: '2026-12-25', name: 'Christmas Day' },
      { date: '2026-12-26', name: 'Boxing Day' },
    ],
    2027: [
      { date: '2027-01-01', name: "New Year's Day" },
      { date: '2027-03-26', name: 'Good Friday' },
      { date: '2027-03-29', name: 'Easter Monday' },
      { date: '2027-05-03', name: 'Early May Bank Holiday' },
      { date: '2027-05-31', name: 'Spring Bank Holiday' },
      { date: '2027-08-30', name: 'Summer Bank Holiday' },
      { date: '2027-12-25', name: 'Christmas Day' },
      { date: '2027-12-26', name: 'Boxing Day' },
    ],
  },
  ca: {
    2025: [
      { date: '2025-01-01', name: "New Year's Day" },
      { date: '2025-02-17', name: 'Family Day' },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-05-19', name: 'Victoria Day' },
      { date: '2025-07-01', name: 'Canada Day' },
      { date: '2025-08-04', name: 'Civic Holiday' },
      { date: '2025-09-01', name: 'Labour Day' },
      { date: '2025-10-13', name: 'Thanksgiving' },
      { date: '2025-11-11', name: 'Remembrance Day' },
      { date: '2025-12-25', name: 'Christmas Day' },
    ],
    2026: [
      { date: '2026-01-01', name: "New Year's Day" },
      { date: '2026-02-16', name: 'Family Day' },
      { date: '2026-04-03', name: 'Good Friday' },
      { date: '2026-05-18', name: 'Victoria Day' },
      { date: '2026-07-01', name: 'Canada Day' },
      { date: '2026-08-03', name: 'Civic Holiday' },
      { date: '2026-09-07', name: 'Labour Day' },
      { date: '2026-10-12', name: 'Thanksgiving' },
      { date: '2026-11-11', name: 'Remembrance Day' },
      { date: '2026-12-25', name: 'Christmas Day' },
    ],
    2027: [
      { date: '2027-01-01', name: "New Year's Day" },
      { date: '2027-02-15', name: 'Family Day' },
      { date: '2027-03-26', name: 'Good Friday' },
      { date: '2027-05-24', name: 'Victoria Day' },
      { date: '2027-07-01', name: 'Canada Day' },
      { date: '2027-08-02', name: 'Civic Holiday' },
      { date: '2027-09-06', name: 'Labour Day' },
      { date: '2027-10-11', name: 'Thanksgiving' },
      { date: '2027-11-11', name: 'Remembrance Day' },
      { date: '2027-12-25', name: 'Christmas Day' },
    ],
  },
  au: {
    2025: [
      { date: '2025-01-01', name: "New Year's Day" },
      { date: '2025-01-27', name: 'Australia Day' },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-04-21', name: 'Easter Monday' },
      { date: '2025-04-25', name: 'Anzac Day' },
      { date: '2025-06-09', name: "Queen's Birthday" },
      { date: '2025-12-25', name: 'Christmas Day' },
      { date: '2025-12-26', name: 'Boxing Day' },
    ],
    2026: [
      { date: '2026-01-01', name: "New Year's Day" },
      { date: '2026-01-26', name: 'Australia Day' },
      { date: '2026-04-03', name: 'Good Friday' },
      { date: '2026-04-06', name: 'Easter Monday' },
      { date: '2026-04-25', name: 'Anzac Day' },
      { date: '2026-06-08', name: "Queen's Birthday" },
      { date: '2026-12-25', name: 'Christmas Day' },
      { date: '2026-12-26', name: 'Boxing Day' },
    ],
    2027: [
      { date: '2027-01-01', name: "New Year's Day" },
      { date: '2027-01-26', name: 'Australia Day' },
      { date: '2027-03-26', name: 'Good Friday' },
      { date: '2027-03-29', name: 'Easter Monday' },
      { date: '2027-04-25', name: 'Anzac Day' },
      { date: '2027-06-14', name: "Queen's Birthday" },
      { date: '2027-12-25', name: 'Christmas Day' },
      { date: '2027-12-26', name: 'Boxing Day' },
    ],
  },
  de: {
    2025: [
      { date: '2025-01-01', name: 'Neujahr' },
      { date: '2025-04-18', name: 'Karfreitag' },
      { date: '2025-04-21', name: 'Ostermontag' },
      { date: '2025-05-01', name: 'Tag der Arbeit' },
      { date: '2025-05-29', name: 'Christi Himmelfahrt' },
      { date: '2025-06-09', name: 'Pfingstmontag' },
      { date: '2025-10-03', name: 'Tag der Deutschen Einheit' },
      { date: '2025-12-25', name: 'Weihnachten' },
      { date: '2025-12-26', name: 'Zweiter Weihnachtsfeiertag' },
    ],
    2026: [
      { date: '2026-01-01', name: 'Neujahr' },
      { date: '2026-04-03', name: 'Karfreitag' },
      { date: '2026-04-06', name: 'Ostermontag' },
      { date: '2026-05-01', name: 'Tag der Arbeit' },
      { date: '2026-05-14', name: 'Christi Himmelfahrt' },
      { date: '2026-05-25', name: 'Pfingstmontag' },
      { date: '2026-10-03', name: 'Tag der Deutschen Einheit' },
      { date: '2026-12-25', name: 'Weihnachten' },
      { date: '2026-12-26', name: 'Zweiter Weihnachtsfeiertag' },
    ],
    2027: [
      { date: '2027-01-01', name: 'Neujahr' },
      { date: '2027-03-26', name: 'Karfreitag' },
      { date: '2027-03-29', name: 'Ostermontag' },
      { date: '2027-05-01', name: 'Tag der Arbeit' },
      { date: '2027-05-06', name: 'Christi Himmelfahrt' },
      { date: '2027-05-17', name: 'Pfingstmontag' },
      { date: '2027-10-03', name: 'Tag der Deutschen Einheit' },
      { date: '2027-12-25', name: 'Weihnachten' },
      { date: '2027-12-26', name: 'Zweiter Weihnachtsfeiertag' },
    ],
  },
  fr: {
    2025: [
      { date: '2025-01-01', name: 'Jour de l\'An' },
      { date: '2025-04-21', name: 'Lundi de Pâques' },
      { date: '2025-05-01', name: 'Fête du Travail' },
      { date: '2025-05-08', name: 'Victoire 1945' },
      { date: '2025-05-29', name: 'Ascension' },
      { date: '2025-06-09', name: 'Lundi de Pentecôte' },
      { date: '2025-07-14', name: 'Fête Nationale' },
      { date: '2025-08-15', name: 'Assomption' },
      { date: '2025-11-01', name: 'Toussaint' },
      { date: '2025-11-11', name: 'Armistice' },
      { date: '2025-12-25', name: 'Noël' },
    ],
    2026: [
      { date: '2026-01-01', name: 'Jour de l\'An' },
      { date: '2026-04-06', name: 'Lundi de Pâques' },
      { date: '2026-05-01', name: 'Fête du Travail' },
      { date: '2026-05-08', name: 'Victoire 1945' },
      { date: '2026-05-14', name: 'Ascension' },
      { date: '2026-05-25', name: 'Lundi de Pentecôte' },
      { date: '2026-07-14', name: 'Fête Nationale' },
      { date: '2026-08-15', name: 'Assomption' },
      { date: '2026-11-01', name: 'Toussaint' },
      { date: '2026-11-11', name: 'Armistice' },
      { date: '2026-12-25', name: 'Noël' },
    ],
    2027: [
      { date: '2027-01-01', name: 'Jour de l\'An' },
      { date: '2027-03-29', name: 'Lundi de Pâques' },
      { date: '2027-05-01', name: 'Fête du Travail' },
      { date: '2027-05-08', name: 'Victoire 1945' },
      { date: '2027-05-06', name: 'Ascension' },
      { date: '2027-05-17', name: 'Lundi de Pentecôte' },
      { date: '2027-07-14', name: 'Fête Nationale' },
      { date: '2027-08-15', name: 'Assomption' },
      { date: '2027-11-01', name: 'Toussaint' },
      { date: '2027-11-11', name: 'Armistice' },
      { date: '2027-12-25', name: 'Noël' },
    ],
  },
  jp: {
    2025: [
      { date: '2025-01-01', name: 'New Year\'s Day' },
      { date: '2025-01-13', name: 'Coming of Age Day' },
      { date: '2025-02-11', name: 'National Foundation Day' },
      { date: '2025-02-23', name: 'Emperor\'s Birthday' },
      { date: '2025-03-20', name: 'Vernal Equinox Day' },
      { date: '2025-04-29', name: 'Showa Day' },
      { date: '2025-05-03', name: 'Constitution Day' },
      { date: '2025-05-04', name: 'Greenery Day' },
      { date: '2025-05-05', name: 'Children\'s Day' },
      { date: '2025-07-21', name: 'Marine Day' },
      { date: '2025-08-11', name: 'Mountain Day' },
      { date: '2025-09-15', name: 'Respect for the Aged Day' },
      { date: '2025-09-23', name: 'Autumnal Equinox Day' },
      { date: '2025-10-13', name: 'Sports Day' },
      { date: '2025-11-03', name: 'Culture Day' },
      { date: '2025-11-23', name: 'Labour Thanksgiving Day' },
    ],
    2026: [
      { date: '2026-01-01', name: 'New Year\'s Day' },
      { date: '2026-01-12', name: 'Coming of Age Day' },
      { date: '2026-02-11', name: 'National Foundation Day' },
      { date: '2026-02-23', name: 'Emperor\'s Birthday' },
      { date: '2026-03-20', name: 'Vernal Equinox Day' },
      { date: '2026-04-29', name: 'Showa Day' },
      { date: '2026-05-03', name: 'Constitution Day' },
      { date: '2026-05-04', name: 'Greenery Day' },
      { date: '2026-05-05', name: 'Children\'s Day' },
      { date: '2026-07-20', name: 'Marine Day' },
      { date: '2026-08-11', name: 'Mountain Day' },
      { date: '2026-09-21', name: 'Respect for the Aged Day' },
      { date: '2026-09-23', name: 'Autumnal Equinox Day' },
      { date: '2026-10-12', name: 'Sports Day' },
      { date: '2026-11-03', name: 'Culture Day' },
      { date: '2026-11-23', name: 'Labour Thanksgiving Day' },
    ],
    2027: [
      { date: '2027-01-01', name: 'New Year\'s Day' },
      { date: '2027-01-11', name: 'Coming of Age Day' },
      { date: '2027-02-11', name: 'National Foundation Day' },
      { date: '2027-02-23', name: 'Emperor\'s Birthday' },
      { date: '2027-03-21', name: 'Vernal Equinox Day' },
      { date: '2027-04-29', name: 'Showa Day' },
      { date: '2027-05-03', name: 'Constitution Day' },
      { date: '2027-05-04', name: 'Greenery Day' },
      { date: '2027-05-05', name: 'Children\'s Day' },
      { date: '2027-07-19', name: 'Marine Day' },
      { date: '2027-08-11', name: 'Mountain Day' },
      { date: '2027-09-20', name: 'Respect for the Aged Day' },
      { date: '2027-09-23', name: 'Autumnal Equinox Day' },
      { date: '2027-10-11', name: 'Sports Day' },
      { date: '2027-11-03', name: 'Culture Day' },
      { date: '2027-11-23', name: 'Labour Thanksgiving Day' },
    ],
  },
  cn: {
    2025: [
      { date: '2025-01-01', name: 'New Year\'s Day' },
      { date: '2025-01-29', name: 'Spring Festival' },
      { date: '2025-04-04', name: 'Qingming Festival' },
      { date: '2025-05-01', name: 'Labour Day' },
      { date: '2025-06-02', name: 'Dragon Boat Festival' },
      { date: '2025-10-01', name: 'National Day' },
      { date: '2025-10-06', name: 'Mid-Autumn Festival' },
    ],
    2026: [
      { date: '2026-01-01', name: 'New Year\'s Day' },
      { date: '2026-02-17', name: 'Spring Festival' },
      { date: '2026-04-05', name: 'Qingming Festival' },
      { date: '2026-05-01', name: 'Labour Day' },
      { date: '2026-06-19', name: 'Dragon Boat Festival' },
      { date: '2026-09-25', name: 'Mid-Autumn Festival' },
      { date: '2026-10-01', name: 'National Day' },
    ],
    2027: [
      { date: '2027-01-01', name: 'New Year\'s Day' },
      { date: '2027-02-06', name: 'Spring Festival' },
      { date: '2027-04-05', name: 'Qingming Festival' },
      { date: '2027-05-01', name: 'Labour Day' },
      { date: '2027-06-09', name: 'Dragon Boat Festival' },
      { date: '2027-09-15', name: 'Mid-Autumn Festival' },
      { date: '2027-10-01', name: 'National Day' },
    ],
  },
  in: {
    2025: [
      { date: '2025-01-01', name: 'New Year\'s Day' },
      { date: '2025-01-14', name: 'Makar Sankranti' },
      { date: '2025-01-26', name: 'Republic Day' },
      { date: '2025-03-14', name: 'Holi' },
      { date: '2025-03-31', name: 'Id-ul-Fitr' },
      { date: '2025-04-14', name: 'Dr. Ambedkar Jayanti' },
      { date: '2025-04-18', name: 'Good Friday' },
      { date: '2025-05-12', name: 'Buddha Purnima' },
      { date: '2025-06-07', name: 'Id-ul-Zuha' },
      { date: '2025-07-06', name: 'Muharram' },
      { date: '2025-08-15', name: 'Independence Day' },
      { date: '2025-08-16', name: 'Janmashtami' },
      { date: '2025-09-05', name: 'Milad-un-Nabi' },
      { date: '2025-10-02', name: 'Gandhi Jayanti' },
      { date: '2025-10-02', name: 'Dussehra' },
      { date: '2025-10-20', name: 'Diwali' },
      { date: '2025-10-21', name: 'Govardhan Puja' },
      { date: '2025-11-01', name: 'Guru Nanak Jayanti' },
      { date: '2025-11-05', name: 'Chhath Puja' },
      { date: '2025-12-25', name: 'Christmas' },
    ],
    2026: [
      { date: '2026-01-01', name: 'New Year\'s Day' },
      { date: '2026-01-14', name: 'Makar Sankranti' },
      { date: '2026-01-26', name: 'Republic Day' },
      { date: '2026-03-04', name: 'Holi' },
      { date: '2026-03-20', name: 'Id-ul-Fitr' },
      { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti' },
      { date: '2026-04-03', name: 'Good Friday' },
      { date: '2026-05-01', name: 'Buddha Purnima' },
      { date: '2026-05-27', name: 'Id-ul-Zuha' },
      { date: '2026-06-25', name: 'Muharram' },
      { date: '2026-08-15', name: 'Independence Day' },
      { date: '2026-08-25', name: 'Milad-un-Nabi' },
      { date: '2026-09-05', name: 'Janmashtami' },
      { date: '2026-10-02', name: 'Gandhi Jayanti' },
      { date: '2026-10-20', name: 'Dussehra' },
      { date: '2026-11-08', name: 'Diwali' },
      { date: '2026-11-20', name: 'Guru Nanak Jayanti' },
      { date: '2026-12-25', name: 'Christmas' },
    ],
    2027: [
      { date: '2027-01-01', name: 'New Year\'s Day' },
      { date: '2027-01-14', name: 'Makar Sankranti' },
      { date: '2027-01-26', name: 'Republic Day' },
      { date: '2027-03-10', name: 'Id-ul-Fitr' },
      { date: '2027-03-22', name: 'Holi' },
      { date: '2027-03-26', name: 'Good Friday' },
      { date: '2027-04-14', name: 'Dr. Ambedkar Jayanti' },
      { date: '2027-05-17', name: 'Id-ul-Zuha' },
      { date: '2027-05-20', name: 'Buddha Purnima' },
      { date: '2027-06-16', name: 'Muharram' },
      { date: '2027-08-15', name: 'Independence Day' },
      { date: '2027-08-16', name: 'Milad-un-Nabi' },
      { date: '2027-08-26', name: 'Janmashtami' },
      { date: '2027-10-02', name: 'Gandhi Jayanti' },
      { date: '2027-10-10', name: 'Dussehra' },
      { date: '2027-10-29', name: 'Diwali' },
      { date: '2027-11-09', name: 'Guru Nanak Jayanti' },
      { date: '2027-12-25', name: 'Christmas' },
    ],
  },
  br: {
    2025: [
      { date: '2025-01-01', name: 'Confraternização Universal' },
      { date: '2025-03-03', name: 'Carnaval' },
      { date: '2025-03-04', name: 'Carnaval' },
      { date: '2025-04-18', name: 'Sexta-feira Santa' },
      { date: '2025-04-21', name: 'Tiradentes' },
      { date: '2025-05-01', name: 'Dia do Trabalho' },
      { date: '2025-06-19', name: 'Corpus Christi' },
      { date: '2025-09-07', name: 'Independência do Brasil' },
      { date: '2025-10-12', name: 'Nossa Senhora Aparecida' },
      { date: '2025-11-02', name: 'Finados' },
      { date: '2025-11-15', name: 'Proclamação da República' },
      { date: '2025-12-25', name: 'Natal' },
    ],
    2026: [
      { date: '2026-01-01', name: 'Confraternização Universal' },
      { date: '2026-02-16', name: 'Carnaval' },
      { date: '2026-02-17', name: 'Carnaval' },
      { date: '2026-04-03', name: 'Sexta-feira Santa' },
      { date: '2026-04-21', name: 'Tiradentes' },
      { date: '2026-05-01', name: 'Dia do Trabalho' },
      { date: '2026-06-04', name: 'Corpus Christi' },
      { date: '2026-09-07', name: 'Independência do Brasil' },
      { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
      { date: '2026-11-02', name: 'Finados' },
      { date: '2026-11-15', name: 'Proclamação da República' },
      { date: '2026-12-25', name: 'Natal' },
    ],
    2027: [
      { date: '2027-01-01', name: 'Confraternização Universal' },
      { date: '2027-02-08', name: 'Carnaval' },
      { date: '2027-02-09', name: 'Carnaval' },
      { date: '2027-03-26', name: 'Sexta-feira Santa' },
      { date: '2027-04-21', name: 'Tiradentes' },
      { date: '2027-05-01', name: 'Dia do Trabalho' },
      { date: '2027-05-27', name: 'Corpus Christi' },
      { date: '2027-09-07', name: 'Independência do Brasil' },
      { date: '2027-10-12', name: 'Nossa Senhora Aparecida' },
      { date: '2027-11-02', name: 'Finados' },
      { date: '2027-11-15', name: 'Proclamação da República' },
      { date: '2027-12-25', name: 'Natal' },
    ],
  },
  mx: {
    2025: [
      { date: '2025-01-01', name: 'Año Nuevo' },
      { date: '2025-02-03', name: 'Día de la Constitución' },
      { date: '2025-03-17', name: 'Natalicio de Benito Juárez' },
      { date: '2025-05-01', name: 'Día del Trabajo' },
      { date: '2025-09-16', name: 'Día de la Independencia' },
      { date: '2025-11-17', name: 'Revolución Mexicana' },
      { date: '2025-12-25', name: 'Navidad' },
    ],
    2026: [
      { date: '2026-01-01', name: 'Año Nuevo' },
      { date: '2026-02-02', name: 'Día de la Constitución' },
      { date: '2026-03-16', name: 'Natalicio de Benito Juárez' },
      { date: '2026-05-01', name: 'Día del Trabajo' },
      { date: '2026-09-16', name: 'Día de la Independencia' },
      { date: '2026-11-16', name: 'Revolución Mexicana' },
      { date: '2026-12-25', name: 'Navidad' },
    ],
    2027: [
      { date: '2027-01-01', name: 'Año Nuevo' },
      { date: '2027-02-01', name: 'Día de la Constitución' },
      { date: '2027-03-15', name: 'Natalicio de Benito Juárez' },
      { date: '2027-05-01', name: 'Día del Trabajo' },
      { date: '2027-09-16', name: 'Día de la Independencia' },
      { date: '2027-11-15', name: 'Revolución Mexicana' },
      { date: '2027-12-25', name: 'Navidad' },
    ],
  },
  es: {
    2025: [
      { date: '2025-01-01', name: 'Año Nuevo' },
      { date: '2025-01-06', name: 'Epifanía del Señor' },
      { date: '2025-04-18', name: 'Viernes Santo' },
      { date: '2025-05-01', name: 'Fiesta del Trabajo' },
      { date: '2025-08-15', name: 'Asunción de la Virgen' },
      { date: '2025-10-12', name: 'Fiesta Nacional de España' },
      { date: '2025-11-01', name: 'Todos los Santos' },
      { date: '2025-12-06', name: 'Día de la Constitución' },
      { date: '2025-12-08', name: 'Inmaculada Concepción' },
      { date: '2025-12-25', name: 'Navidad' },
    ],
    2026: [
      { date: '2026-01-01', name: 'Año Nuevo' },
      { date: '2026-01-06', name: 'Epifanía del Señor' },
      { date: '2026-04-03', name: 'Viernes Santo' },
      { date: '2026-05-01', name: 'Fiesta del Trabajo' },
      { date: '2026-08-15', name: 'Asunción de la Virgen' },
      { date: '2026-10-12', name: 'Fiesta Nacional de España' },
      { date: '2026-11-01', name: 'Todos los Santos' },
      { date: '2026-12-06', name: 'Día de la Constitución' },
      { date: '2026-12-08', name: 'Inmaculada Concepción' },
      { date: '2026-12-25', name: 'Navidad' },
    ],
    2027: [
      { date: '2027-01-01', name: 'Año Nuevo' },
      { date: '2027-01-06', name: 'Epifanía del Señor' },
      { date: '2027-03-26', name: 'Viernes Santo' },
      { date: '2027-05-01', name: 'Fiesta del Trabajo' },
      { date: '2027-08-15', name: 'Asunción de la Virgen' },
      { date: '2027-10-12', name: 'Fiesta Nacional de España' },
      { date: '2027-11-01', name: 'Todos los Santos' },
      { date: '2027-12-06', name: 'Día de la Constitución' },
      { date: '2027-12-08', name: 'Inmaculada Concepción' },
      { date: '2027-12-25', name: 'Navidad' },
    ],
  },
  it: {
    2025: [
      { date: '2025-01-01', name: 'Capodanno' },
      { date: '2025-01-06', name: 'Epifania' },
      { date: '2025-04-20', name: 'Pasqua' },
      { date: '2025-04-21', name: 'Lunedì dell\'Angelo' },
      { date: '2025-04-25', name: 'Festa della Liberazione' },
      { date: '2025-05-01', name: 'Festa del Lavoro' },
      { date: '2025-06-02', name: 'Festa della Repubblica' },
      { date: '2025-08-15', name: 'Ferragosto' },
      { date: '2025-11-01', name: 'Tutti i Santi' },
      { date: '2025-12-08', name: 'Immacolata Concezione' },
      { date: '2025-12-25', name: 'Natale' },
      { date: '2025-12-26', name: 'Santo Stefano' },
    ],
    2026: [
      { date: '2026-01-01', name: 'Capodanno' },
      { date: '2026-01-06', name: 'Epifania' },
      { date: '2026-04-05', name: 'Pasqua' },
      { date: '2026-04-06', name: 'Lunedì dell\'Angelo' },
      { date: '2026-04-25', name: 'Festa della Liberazione' },
      { date: '2026-05-01', name: 'Festa del Lavoro' },
      { date: '2026-06-02', name: 'Festa della Repubblica' },
      { date: '2026-08-15', name: 'Ferragosto' },
      { date: '2026-11-01', name: 'Tutti i Santi' },
      { date: '2026-12-08', name: 'Immacolata Concezione' },
      { date: '2026-12-25', name: 'Natale' },
      { date: '2026-12-26', name: 'Santo Stefano' },
    ],
    2027: [
      { date: '2027-01-01', name: 'Capodanno' },
      { date: '2027-01-06', name: 'Epifania' },
      { date: '2027-03-28', name: 'Pasqua' },
      { date: '2027-03-29', name: 'Lunedì dell\'Angelo' },
      { date: '2027-04-25', name: 'Festa della Liberazione' },
      { date: '2027-05-01', name: 'Festa del Lavoro' },
      { date: '2027-06-02', name: 'Festa della Repubblica' },
      { date: '2027-08-15', name: 'Ferragosto' },
      { date: '2027-11-01', name: 'Tutti i Santi' },
      { date: '2027-12-08', name: 'Immacolata Concezione' },
      { date: '2027-12-25', name: 'Natale' },
      { date: '2027-12-26', name: 'Santo Stefano' },
    ],
  },
  kr: {
    2025: [
      { date: '2025-01-01', name: 'New Year\'s Day' },
      { date: '2025-01-28', name: 'Lunar New Year\'s Eve' },
      { date: '2025-01-29', name: 'Lunar New Year' },
      { date: '2025-01-30', name: 'Lunar New Year Holiday' },
      { date: '2025-03-01', name: 'Independence Movement Day' },
      { date: '2025-05-05', name: 'Children\'s Day' },
      { date: '2025-05-05', name: 'Buddha\'s Birthday' },
      { date: '2025-06-06', name: 'Memorial Day' },
      { date: '2025-08-15', name: 'Liberation Day' },
      { date: '2025-10-05', name: 'Chuseok Eve' },
      { date: '2025-10-06', name: 'Chuseok' },
      { date: '2025-10-07', name: 'Chuseok Holiday' },
      { date: '2025-10-03', name: 'National Foundation Day' },
      { date: '2025-10-09', name: 'Hangul Day' },
      { date: '2025-12-25', name: 'Christmas' },
    ],
    2026: [
      { date: '2026-01-01', name: 'New Year\'s Day' },
      { date: '2026-02-16', name: 'Lunar New Year\'s Eve' },
      { date: '2026-02-17', name: 'Lunar New Year' },
      { date: '2026-02-18', name: 'Lunar New Year Holiday' },
      { date: '2026-03-01', name: 'Independence Movement Day' },
      { date: '2026-05-05', name: 'Children\'s Day' },
      { date: '2026-05-24', name: 'Buddha\'s Birthday' },
      { date: '2026-06-06', name: 'Memorial Day' },
      { date: '2026-08-15', name: 'Liberation Day' },
      { date: '2026-09-24', name: 'Chuseok Eve' },
      { date: '2026-09-25', name: 'Chuseok' },
      { date: '2026-09-26', name: 'Chuseok Holiday' },
      { date: '2026-10-03', name: 'National Foundation Day' },
      { date: '2026-10-09', name: 'Hangul Day' },
      { date: '2026-12-25', name: 'Christmas' },
    ],
    2027: [
      { date: '2027-01-01', name: 'New Year\'s Day' },
      { date: '2027-02-05', name: 'Lunar New Year\'s Eve' },
      { date: '2027-02-06', name: 'Lunar New Year' },
      { date: '2027-02-07', name: 'Lunar New Year Holiday' },
      { date: '2027-03-01', name: 'Independence Movement Day' },
      { date: '2027-05-05', name: 'Children\'s Day' },
      { date: '2027-05-13', name: 'Buddha\'s Birthday' },
      { date: '2027-06-06', name: 'Memorial Day' },
      { date: '2027-08-15', name: 'Liberation Day' },
      { date: '2027-09-14', name: 'Chuseok Eve' },
      { date: '2027-09-15', name: 'Chuseok' },
      { date: '2027-09-16', name: 'Chuseok Holiday' },
      { date: '2027-10-03', name: 'National Foundation Day' },
      { date: '2027-10-09', name: 'Hangul Day' },
      { date: '2027-12-25', name: 'Christmas' },
    ],
  },
};

// Helper function to get holiday count for a calendar
export function getHolidayCount(calendarId: string): number {
  const calendarData = holidaysByCalendarAndYear[calendarId];
  if (!calendarData) return 0;

  // Get count from the first available year
  const years = Object.keys(calendarData);
  if (years.length === 0) return 0;

  return calendarData[parseInt(years[0])].length;
}

export default function SkipHolidaysScreen() {
  const router = useRouter();
  const { draft } = useDraftAlarmStore();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  if (!draft) {
    router.back();
    return null;
  }

  const selectedCalendar = holidayCalendars.find(
    (c) => c.id === draft.holidayCalendarId
  );

  const holidays =
    selectedCalendar && holidaysByCalendarAndYear[selectedCalendar.id]
      ? holidaysByCalendarAndYear[selectedCalendar.id][selectedYear] || []
      : [];

  const holidayCount = selectedCalendar
    ? getHolidayCount(selectedCalendar.id)
    : 0;

  const handlePreviousYear = () => {
    setSelectedYear((y) => y - 1);
  };

  const handleNextYear = () => {
    setSelectedYear((y) => y + 1);
  };

  const renderHolidayItem = (item: Holiday, index: number, isLast: boolean) => {
    const date = parseISO(item.date);
    const formattedDate = format(date, 'MMM d');
    const dayOfWeek = format(date, 'EEE');

    return (
      <View key={item.date + item.name}>
        <View style={styles.holidayItem}>
          <Text style={styles.holidayName}>{item.name}</Text>
          <Text style={styles.holidayDate}>
            {formattedDate} • {dayOfWeek}
          </Text>
        </View>
        {!isLast && <View style={styles.separator} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopNav title="" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PageTitle
          title="Skip holidays"
          subtitle="Your alarm will automatically skip if it falls on a holiday."
        />

        {/* Calendar Section */}
        <View style={styles.section}>
          <SectionTitle title="Calendar" />
          <View style={styles.sectionContent}>
            <Entry
              variant="selection"
              label={selectedCalendar?.name || 'Select a calendar'}
              sublabel={
                selectedCalendar ? `${holidayCount} holidays` : undefined
              }
              icon={
                selectedCalendar ? (
                  <Text style={styles.flagIcon}>{selectedCalendar.flag}</Text>
                ) : undefined
              }
              onPress={() => router.push('/holidays/calendar')}
            />
          </View>
        </View>

        {/* Holidays Section */}
        {selectedCalendar && (
          <View style={styles.section}>
            <SectionTitle
              title="Holidays"
              action={
                <View style={styles.yearPicker}>
                  <TouchableOpacity
                    onPress={handlePreviousYear}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.yearText}>{selectedYear}</Text>
                  <TouchableOpacity
                    onPress={handleNextYear}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              }
            />
            <View style={styles.sectionContent}>
              {holidays.length > 0 ? (
                <Card>
                  {holidays.map((holiday, index) =>
                    renderHolidayItem(
                      holiday,
                      index,
                      index === holidays.length - 1
                    )
                  )}
                </Card>
              ) : (
                <Card>
                  <Text style={styles.noHolidaysText}>
                    No holidays available for {selectedYear}
                  </Text>
                </Card>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionContent: {
    paddingHorizontal: spacing.lg,
  },
  flagIcon: {
    fontSize: 24,
  },
  yearPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  yearText: {
    ...typography.label,
    color: colors.textPrimary,
    minWidth: 48,
    textAlign: 'center',
  },
  holidayItem: {
    paddingVertical: spacing.md,
  },
  holidayName: {
    ...typography.body,
    fontFamily: 'Outfit-SemiBold',
    color: colors.textPrimary,
  },
  holidayDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderSubtle,
  },
  noHolidaysText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
