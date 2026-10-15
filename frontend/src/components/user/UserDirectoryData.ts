export interface RegisteredRecipientInfo {
  id: string;
  name: string;
  phone: string;
  account: string;
  defaultBank: string;
  category: string;
  avatarUrl: string;
  initialBalance: number;
  email: string;
  city: string;
  joinDate: string;
  kycStatus: 'Terverifikasi (Full KYC)' | 'Premium VIP KYC';
  pin: string;
}

const RAW_120_USERS: Array<{
  id: string;
  name: string;
  phone: string;
  account: string;
  bank: string;
  city: string;
  balance: number;
  avatar?: string;
}> = [
  // 4 Primary Featured Accounts
  { id: 'CUST-109', name: 'Afnan Yusuf', phone: '081234567890', account: '1800015394804', bank: 'BANK MANDIRI', city: 'Jakarta Selatan', balance: 25450000, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' },
  { id: 'CUST-304', name: 'Luciana Chen', phone: '081987654321', account: '522039182300', bank: 'BCA', city: 'Jakarta Barat', balance: 14200000, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { id: 'CUST-982', name: 'Caturnusa', phone: '085611223344', account: '021001092834', bank: 'BRI', city: 'Bandung', balance: 8950000, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face' },
  { id: 'CUST-441', name: 'Budi Santoso', phone: '081388990011', account: '880813889900', bank: 'SeaBank', city: 'Surabaya', balance: 6500000, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face' },

  // 30 Active Database Customer IDs (CUST-xxx in jatelindo_security.db)
  { id: 'CUST-176', name: 'Rizky Pratama Putra', phone: '081280010005', account: '134009821005', bank: 'BANK MANDIRI', city: 'Jakarta Pusat', balance: 19800000 },
  { id: 'CUST-293', name: 'Siti Rahmawati', phone: '081280010006', account: '524091823006', bank: 'BCA', city: 'Tangerang Selatan', balance: 12450000 },
  { id: 'CUST-665', name: 'Andi Wijaya Kusuma', phone: '081280010007', account: '034101009207', bank: 'BRI', city: 'Semarang', balance: 15700000 },
  { id: 'CUST-880', name: 'Dewi Anggraini Putri', phone: '081280010008', account: '088912340008', bank: 'BNI', city: 'Yogyakarta', balance: 21300000 },
  { id: 'CUST-394', name: 'Hendra Gunawan', phone: '081280010009', account: '880899120009', bank: 'SeaBank', city: 'Medan', balance: 9400000 },
  { id: 'CUST-819', name: 'Nadia Safitri', phone: '081280010010', account: '712099810010', bank: 'BSI', city: 'Bekasi', balance: 11250000 },
  { id: 'CUST-324', name: 'Fajar Nugroho', phone: '081280010011', account: '522098710011', bank: 'BCA', city: 'Depok', balance: 7850000 },
  { id: 'CUST-683', name: 'Rina Marlina Sari', phone: '081280010012', account: '180009281012', bank: 'BANK MANDIRI', city: 'Bogor', balance: 16900000 },
  { id: 'CUST-356', name: 'Dedi Kurniawan', phone: '081280010013', account: '021009812013', bank: 'BRI', city: 'Malang', balance: 5400000 },
  { id: 'CUST-422', name: 'Ayu Lestari Ningrum', phone: '081280010014', account: '044512980014', bank: 'BNI', city: 'Denpasar', balance: 18200000 },
  { id: 'CUST-953', name: 'Agus Setiawan', phone: '081280010015', account: '700918270015', bank: 'CIMB Niaga', city: 'Makassar', balance: 13600000 },
  { id: 'CUST-816', name: 'Bagas Adi Saputra', phone: '081280010016', account: '522019280016', bank: 'BCA', city: 'Surabaya', balance: 9150000 },
  { id: 'CUST-208', name: 'Putri Maharani', phone: '081280010017', account: '180007651017', bank: 'BANK MANDIRI', city: 'Jakarta Timur', balance: 22800000 },
  { id: 'CUST-361', name: 'Ilham Ramadhan', phone: '081280010018', account: '880877120018', bank: 'SeaBank', city: 'Bandung', balance: 6750000 },
  { id: 'CUST-869', name: 'Maya Indah Permata', phone: '081280010019', account: '714509120019', bank: 'BSI', city: 'Palembang', balance: 14900000 },
  { id: 'CUST-369', name: 'Reza Pahlevi', phone: '081280010020', account: '021005541020', bank: 'BRI', city: 'Balikpapan', balance: 10300000 },
  { id: 'CUST-706', name: 'Andi Pratama', phone: '081280010021', account: '522069120021', bank: 'BCA', city: 'Jakarta Utara', balance: 17450000 },
  { id: 'CUST-942', name: 'Siska Amelia', phone: '081280010022', account: '088944120022', bank: 'BNI', city: 'Semarang', balance: 8200000 },
  { id: 'CUST-169', name: 'Taufik Hidayat', phone: '081280010023', account: '180003321023', bank: 'BANK MANDIRI', city: 'Solo', balance: 11800000 },
  { id: 'CUST-173', name: 'Nia Lestari', phone: '081280010024', account: '880866510024', bank: 'SeaBank', city: 'Yogyakarta', balance: 9600000 },
  { id: 'CUST-351', name: 'Wahyu Hidayatullah', phone: '081280010025', account: '719088210025', bank: 'BSI', city: 'Banda Aceh', balance: 15100000 },
  { id: 'CUST-423', name: 'Dian Sastro Wardoyo', phone: '081280010026', account: '522071900026', bank: 'BCA', city: 'Jakarta Selatan', balance: 29400000 },
  { id: 'CUST-650', name: 'Gilang Dirga Pratama', phone: '081280010027', account: '021008847027', bank: 'BRI', city: 'Pekanbaru', balance: 7300000 },
  { id: 'CUST-776', name: 'Kartika Sari Dewi', phone: '081280010028', account: '180005129028', bank: 'BANK MANDIRI', city: 'Padang', balance: 13200000 },
  { id: 'CUST-955', name: 'Siti Rahma Aulia', phone: '081280010029', account: '088937200029', bank: 'BNI', city: 'Banjarmasin', balance: 16400000 },
  { id: 'CUST-145', name: 'Bambang Pamungkas', phone: '081280010030', account: '700944120030', bank: 'CIMB Niaga', city: 'Jakarta Timur', balance: 24100000 },
  { id: 'CUST-206', name: 'Vina Panduwinata', phone: '081280010031', account: '522088120031', bank: 'BCA', city: 'Bogor', balance: 19500000 },
  { id: 'CUST-378', name: 'Lukman Hakim', phone: '081280010032', account: '180001944032', bank: 'BANK MANDIRI', city: 'Cirebon', balance: 8700000 },
  { id: 'CUST-247', name: 'Ratna Galih', phone: '081280010033', account: '880811230033', bank: 'SeaBank', city: 'Tangerang', balance: 12900000 },
  { id: 'CUST-152', name: 'Eko Prasetyo', phone: '081280010034', account: '021003301034', bank: 'BRI', city: 'Surakarta', balance: 6100000 },

  // Remaining 86 Unique Indonesian Users (Total = 120 Users)
  { id: 'CUST-501', name: 'Aditya Warman', phone: '081390020035', account: '522040010035', bank: 'BCA', city: 'Jakarta Selatan', balance: 14500000 },
  { id: 'CUST-502', name: 'Nabila Syakieb Putri', phone: '081390020036', account: '180004001036', bank: 'BANK MANDIRI', city: 'Bandung', balance: 18750000 },
  { id: 'CUST-503', name: 'Dimas Anggara', phone: '081390020037', account: '021004001037', bank: 'BRI', city: 'Surabaya', balance: 9200000 },
  { id: 'CUST-504', name: 'Citra Kirana Dewi', phone: '081390020038', account: '088940010038', bank: 'BNI', city: 'Bogor', balance: 22100000 },
  { id: 'CUST-505', name: 'Bayu Skak Wijaya', phone: '081390020039', account: '880840010039', bank: 'SeaBank', city: 'Malang', balance: 5800000 },
  { id: 'CUST-506', name: 'Anisa Rahma Adi', phone: '081390020040', account: '712040010040', bank: 'BSI', city: 'Bandung', balance: 11400000 },
  { id: 'CUST-507', name: 'Raffi Ahmad Farid', phone: '081390020041', account: '522040010041', bank: 'BCA', city: 'Depok', balance: 45200000 },
  { id: 'CUST-508', name: 'Nagita Slavina', phone: '081390020042', account: '180004001042', bank: 'BANK MANDIRI', city: 'Jakarta Selatan', balance: 38900000 },
  { id: 'CUST-509', name: 'Deddy Corbuzier', phone: '081390020043', account: '700940010043', bank: 'CIMB Niaga', city: 'Tangerang Selatan', balance: 41600000 },
  { id: 'CUST-510', name: 'Prilly Latuconsina', phone: '081390020044', account: '522040010044', bank: 'BCA', city: 'Tangerang', balance: 27300000 },
  { id: 'CUST-511', name: 'Iqbaal Ramadhan', phone: '081390020045', account: '088940010045', bank: 'BNI', city: 'Jakarta Timur', balance: 19400000 },
  { id: 'CUST-512', name: 'Maudy Ayunda', phone: '081390020046', account: '180004001046', bank: 'BANK MANDIRI', city: 'Jakarta Selatan', balance: 31200000 },
  { id: 'CUST-513', name: 'Jerome Polin Sijabat', phone: '081390020047', account: '522040010047', bank: 'BCA', city: 'Surabaya', balance: 26800000 },
  { id: 'CUST-514', name: 'Najwa Shihab', phone: '081390020048', account: '712040010048', bank: 'BSI', city: 'Jakarta Pusat', balance: 34500000 },
  { id: 'CUST-515', name: 'Arif Muhammad', phone: '081390020049', account: '021004001049', bank: 'BRI', city: 'Medan', balance: 15900000 },
  { id: 'CUST-516', name: 'Tiara Andini', phone: '081390020050', account: '880840010050', bank: 'SeaBank', city: 'Jember', balance: 12700000 },
  { id: 'CUST-517', name: 'Lyodra Ginting', phone: '081390020051', account: '522040010051', bank: 'BCA', city: 'Medan', balance: 16300000 },
  { id: 'CUST-518', name: 'Ziva Magnolya', phone: '081390020052', account: '180004001052', bank: 'BANK MANDIRI', city: 'Bogor', balance: 14100000 },
  { id: 'CUST-519', name: 'Mahalini Raharja', phone: '081390020053', account: '088940010053', bank: 'BNI', city: 'Denpasar', balance: 20500000 },
  { id: 'CUST-520', name: 'Rizky Febian', phone: '081390020054', account: '522040010054', bank: 'BCA', city: 'Bandung', balance: 23400000 },
  { id: 'CUST-521', name: 'Afgan Syahreza', phone: '085710030055', account: '180004001055', bank: 'BANK MANDIRI', city: 'Jakarta Selatan', balance: 28900000 },
  { id: 'CUST-522', name: 'Raisa Andriana', phone: '085710030056', account: '522040010056', bank: 'BCA', city: 'Jakarta Selatan', balance: 33700000 },
  { id: 'CUST-523', name: 'Isyana Sarasvati', phone: '085710030057', account: '700940010057', bank: 'CIMB Niaga', city: 'Bandung', balance: 24600000 },
  { id: 'CUST-524', name: 'Tulus Rusydi', phone: '085710030058', account: '021004001058', bank: 'BRI', city: 'Bukittinggi', balance: 19800000 },
  { id: 'CUST-525', name: 'Fiersa Besari', phone: '085710030059', account: '088940010059', bank: 'BNI', city: 'Bandung', balance: 11200000 },
  { id: 'CUST-526', name: 'Boy William', phone: '085710030060', account: '522040010060', bank: 'BCA', city: 'Jakarta Utara', balance: 29100000 },
  { id: 'CUST-527', name: 'Enzy Storia', phone: '085710030061', account: '180004001061', bank: 'BANK MANDIRI', city: 'Jakarta Barat', balance: 17800000 },
  { id: 'CUST-528', name: 'Hesti Purwadinata', phone: '085710030062', account: '880840010062', bank: 'SeaBank', city: 'Bogor', balance: 13500000 },
  { id: 'CUST-529', name: 'Vincent Rompies', phone: '085710030063', account: '522040010063', bank: 'BCA', city: 'Tangerang Selatan', balance: 26400000 },
  { id: 'CUST-530', name: 'Desta Mahendra', phone: '085710030064', account: '180004001064', bank: 'BANK MANDIRI', city: 'Jakarta Selatan', balance: 25100000 },
  { id: 'CUST-531', name: 'Surya Insomnia', phone: '085710030065', account: '088940010065', bank: 'BNI', city: 'Tangerang', balance: 18300000 },
  { id: 'CUST-532', name: 'Andre Taulany', phone: '085710030066', account: '712040010066', bank: 'BSI', city: 'Tangerang Selatan', balance: 39200000 },
  { id: 'CUST-533', name: 'Wendi Cagur', phone: '085710030067', account: '021004001067', bank: 'BRI', city: 'Depok', balance: 21700000 },
  { id: 'CUST-534', name: 'Ayu Ting Ting', phone: '085710030068', account: '522040010068', bank: 'BCA', city: 'Depok', balance: 32400000 },
  { id: 'CUST-535', name: 'Ivan Gunawan', phone: '085710030069', account: '180004001069', bank: 'BANK MANDIRI', city: 'Jakarta Barat', balance: 36800000 },
  { id: 'CUST-536', name: 'Ruben Onsu', phone: '085710030070', account: '522040010070', bank: 'BCA', city: 'Jakarta Selatan', balance: 28500000 },
  { id: 'CUST-537', name: 'Baim Wong', phone: '085710030071', account: '700940010071', bank: 'CIMB Niaga', city: 'Jakarta Pusat', balance: 31900000 },
  { id: 'CUST-538', name: 'Paula Verhoeven', phone: '085710030072', account: '088940010072', bank: 'BNI', city: 'Semarang', balance: 22400000 },
  { id: 'CUST-539', name: 'Atta Halilintar', phone: '085710030073', account: '712040010073', bank: 'BSI', city: 'Jakarta Selatan', balance: 44800000 },
  { id: 'CUST-540', name: 'Aurel Hermansyah', phone: '085710030074', account: '522040010074', bank: 'BCA', city: 'Depok', balance: 35600000 },
  { id: 'CUST-541', name: 'Denny Sumargo', phone: '087820040075', account: '522040010075', bank: 'BCA', city: 'Makassar', balance: 29700000 },
  { id: 'CUST-542', name: 'Olivia Allan', phone: '087820040076', account: '180004001076', bank: 'BANK MANDIRI', city: 'Jakarta Utara', balance: 27900000 },
  { id: 'CUST-543', name: 'Raditya Dika', phone: '087820040077', account: '522040010077', bank: 'BCA', city: 'Jakarta Selatan', balance: 37400000 },
  { id: 'CUST-544', name: 'Anissa Aziza', phone: '087820040078', account: '088940010078', bank: 'BNI', city: 'Bengkulu', balance: 18600000 },
  { id: 'CUST-545', name: 'Ernest Prakasa', phone: '087820040079', account: '700940010079', bank: 'CIMB Niaga', city: 'Jakarta Barat', balance: 26200000 },
  { id: 'CUST-546', name: 'Meira Anastasia', phone: '087820040080', account: '522040010080', bank: 'BCA', city: 'Pematangsiantar', balance: 15400000 },
  { id: 'CUST-547', name: 'Pandji Pragiwaksono', phone: '087820040081', account: '180004001081', bank: 'BANK MANDIRI', city: 'Bandung', balance: 23800000 },
  { id: 'CUST-548', name: 'Arie Kriting', phone: '087820040082', account: '021004001082', bank: 'BRI', city: 'Kendari', balance: 11900000 },
  { id: 'CUST-549', name: 'Indah Permatasari', phone: '087820040083', account: '712040010083', bank: 'BSI', city: 'Makassar', balance: 14700000 },
  { id: 'CUST-550', name: 'Babe Cabita Putra', phone: '087820040084', account: '880840010084', bank: 'SeaBank', city: 'Medan', balance: 9800000 },
  { id: 'CUST-551', name: 'Marshel Widianto', phone: '087820040085', account: '021004001085', bank: 'BRI', city: 'Jakarta Utara', balance: 10500000 },
  { id: 'CUST-552', name: 'Kiky Saputri', phone: '087820040086', account: '180004001086', bank: 'BANK MANDIRI', city: 'Garut', balance: 19200000 },
  { id: 'CUST-553', name: 'Indra Jegel', phone: '087820040087', account: '522040010087', bank: 'BCA', city: 'Binjai', balance: 16800000 },
  { id: 'CUST-554', name: 'Boris Bokir', phone: '087820040088', account: '088940010088', bank: 'BNI', city: 'Bandung', balance: 15200000 },
  { id: 'CUST-555', name: 'Bene Dion Rajagukguk', phone: '087820040089', account: '180004001089', bank: 'BANK MANDIRI', city: 'Tebing Tinggi', balance: 17600000 },
  { id: 'CUST-556', name: 'Oki Rengga', phone: '087820040090', account: '021004001090', bank: 'BRI', city: 'Padang Ratu', balance: 13400000 },
  { id: 'CUST-557', name: 'Cinta Laura Kiehl', phone: '087820040091', account: '522040010091', bank: 'BCA', city: 'Denpasar', balance: 36100000 },
  { id: 'CUST-558', name: 'Chelsea Islan', phone: '087820040092', account: '700940010092', bank: 'CIMB Niaga', city: 'Jakarta Selatan', balance: 28300000 },
  { id: 'CUST-559', name: 'Pevita Pearce', phone: '087820040093', account: '522040010093', bank: 'BCA', city: 'Jakarta Selatan', balance: 30400000 },
  { id: 'CUST-560', name: 'Raline Shah', phone: '087820040094', account: '180004001094', bank: 'BANK MANDIRI', city: 'Medan', balance: 42100000 },
  { id: 'CUST-561', name: 'Nicholas Saputra', phone: '082130050095', account: '522040010095', bank: 'BCA', city: 'Jakarta Selatan', balance: 34800000 },
  { id: 'CUST-562', name: 'Reza Rahadian', phone: '082130050096', account: '180004001096', bank: 'BANK MANDIRI', city: 'Bogor', balance: 33100000 },
  { id: 'CUST-563', name: 'Iko Uwais', phone: '082130050097', account: '712040010097', bank: 'BSI', city: 'Bekasi', balance: 25900000 },
  { id: 'CUST-564', name: 'Joe Taslim', phone: '082130050098', account: '522040010098', bank: 'BCA', city: 'Palembang', balance: 29600000 },
  { id: 'CUST-565', name: 'Rio Dewanto', phone: '082130050099', account: '088940010099', bank: 'BNI', city: 'Jakarta Selatan', balance: 21400000 },
  { id: 'CUST-566', name: 'Atiqah Hasiholan', phone: '082130050100', account: '180004001100', bank: 'BANK MANDIRI', city: 'Jakarta Pusat', balance: 19700000 },
  { id: 'CUST-567', name: 'Chicco Jerikho', phone: '082130050101', account: '522040010101', bank: 'BCA', city: 'Jakarta Selatan', balance: 22900000 },
  { id: 'CUST-568', name: 'Putri Marino', phone: '082130050102', account: '021004001102', bank: 'BRI', city: 'Denpasar', balance: 18400000 },
  { id: 'CUST-569', name: 'Vino G. Bastian', phone: '082130050103', account: '180004001103', bank: 'BANK MANDIRI', city: 'Padang', balance: 27100000 },
  { id: 'CUST-570', name: 'Marsha Timothy', phone: '082130050104', account: '522040010104', bank: 'BCA', city: 'Jakarta Selatan', balance: 24300000 },
  { id: 'CUST-571', name: 'Abimana Aryasatya', phone: '082130050105', account: '088940010105', bank: 'BNI', city: 'Jakarta Barat', balance: 20800000 },
  { id: 'CUST-572', name: 'Tara Basro', phone: '082130050106', account: '700940010106', bank: 'CIMB Niaga', city: 'Makassar', balance: 19100000 },
  { id: 'CUST-573', name: 'Ario Bayu Wicaksono', phone: '082130050107', account: '180004001107', bank: 'BANK MANDIRI', city: 'Surabaya', balance: 23600000 },
  { id: 'CUST-574', name: 'Laura Basuki', phone: '082130050108', account: '522040010108', bank: 'BCA', city: 'Jakarta Utara', balance: 26700000 },
  { id: 'CUST-575', name: 'Dion Wiyoko', phone: '082130050109', account: '522040010109', bank: 'BCA', city: 'Surabaya', balance: 28200000 },
  { id: 'CUST-576', name: 'Sheila Dara Aisha', phone: '082130050110', account: '880840010110', bank: 'SeaBank', city: 'Bandung', balance: 17300000 },
  { id: 'CUST-577', name: 'Vidi Aldiano', phone: '082130050111', account: '180004001111', bank: 'BANK MANDIRI', city: 'Jakarta Selatan', balance: 30900000 },
  { id: 'CUST-578', name: 'Sherina Munaf', phone: '082130050112', account: '522040010112', bank: 'BCA', city: 'Bandung', balance: 29400000 },
  { id: 'CUST-579', name: 'Baskara Mahendra', phone: '082130050113', account: '088940010113', bank: 'BNI', city: 'Jakarta Selatan', balance: 16500000 },
  { id: 'CUST-580', name: 'Febby Rastanty', phone: '082130050114', account: '180004001114', bank: 'BANK MANDIRI', city: 'Jakarta Timur', balance: 18900000 },
  { id: 'CUST-581', name: 'Yuki Kato', phone: '082240060115', account: '522040010115', bank: 'BCA', city: 'Malang', balance: 21600000 },
  { id: 'CUST-582', name: 'Jessica Mila', phone: '082240060116', account: '700940010116', bank: 'CIMB Niaga', city: 'Banda Aceh', balance: 25300000 },
  { id: 'CUST-583', name: 'Kevin Julio', phone: '082240060117', account: '021004001117', bank: 'BRI', city: 'Jakarta Barat', balance: 14800000 },
  { id: 'CUST-584', name: 'Ricky Harun', phone: '082240060118', account: '712040010118', bank: 'BSI', city: 'Bandung', balance: 19300000 },
  { id: 'CUST-585', name: 'Herfiza Novianti', phone: '082240060119', account: '712040010119', bank: 'BSI', city: 'Sukabumi', balance: 16700000 },
  { id: 'CUST-586', name: 'Dude Harlino', phone: '082240060120', account: '712040010120', bank: 'BSI', city: 'Jakarta Timur', balance: 28800000 }
];

const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];

export const REGISTERED_USERS: RegisteredRecipientInfo[] = RAW_120_USERS.map((u, idx) => {
  const emailSlug = u.name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  const day = String((idx % 28) + 1).padStart(2, '0');
  const month = MONTHS_ID[idx % MONTHS_ID.length];
  const year = idx < 40 ? '2025' : '2026';

  return {
    id: u.id,
    name: u.name,
    phone: u.phone,
    account: u.account,
    defaultBank: u.bank,
    category: 'Nasabah J-Pay Terdaftar',
    avatarUrl: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=0284c7&color=fff&bold=true`,
    initialBalance: u.balance,
    email: `${emailSlug}@jatelindo-pay.id`,
    city: u.city,
    joinDate: `${day} ${month} ${year}`,
    kycStatus: idx % 3 === 0 ? 'Premium VIP KYC' : 'Terverifikasi (Full KYC)',
    pin: '123456'
  };
});
