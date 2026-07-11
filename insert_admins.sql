USE ecole2026_local; /* Remplacez ecole2026_local par le nom exact de la BD en ligne si besoin */

INSERT INTO `Admin` (`ID`, `nom`, `username`, `password`, `actif`, `typeAdmin`, `mobile`, `alanyaID`, `created_at`, `isDelete`) VALUES
(1, 'Admin Principal', 'admin@ecole.fr', 'peda2026', 1, 1, '', '', '2026-05-13 08:02:06', 0),
(2, 'Fedjio Noumbissi', 'fedjioguenole@gmail.com', '1234', 1, 3, '0', NULL, '2026-05-13 08:04:24', 0),
(3, 'sibefo', 'fedjiguenole@gmail.com', '1234', 1, 2, NULL, NULL, '2026-05-13 08:06:14', 0),
(4, 'Atangana', 'fedjguenole@gmail.com', '1234', 1, 4, '0', NULL, '2026-05-13 08:07:18', 0),
(5, 'Admin Test', 'admin_test', '$2y$12$Q2CQhPOsh0nxDOLt9W6Vf.71tAqz.FogrKktZfGxux6lJHvqq16R.', 1, 0, NULL, NULL, '2026-05-16 17:24:42', 0);
