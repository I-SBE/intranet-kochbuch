/**
 * @file db.js
 * @description Erstellt einen Verbindungspool zur MariaDB-Datenbank mit Umgebungsvariablen.
 * 
 * @module db
 */

//=================================================

import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

//=================================================

/**
 * Verbindungspool zur MariaDB-Datenbank.
 *
 * Die Verbindungsdaten (Host, Benutzer, Passwort, Datenbankname, Verbindungslimit)
 * werden aus den Umgebungsvariablen geladen.
 * @requires mariadb
 * @requires dotenv
 * @type {mariadb.Pool}
 */

//=================================================

export const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
});