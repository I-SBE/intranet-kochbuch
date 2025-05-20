import mariadb from 'mariadb';

export const pool = mariadb.createPool({
  host: 'localhost',
  user: 'isbeih',
  password: '123456',
  database: 'fi37_sbeih_fpadw'
});