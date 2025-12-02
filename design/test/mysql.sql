DROP DATABASE IF EXISTS datacollector;
CREATE DATABASE `datacollector`;

USE `datacollector`;



--
-- Table structure for table `country`
--

DROP TABLE IF EXISTS `country`;
CREATE TABLE `country`(
    `id` INT(12) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) COLLATE UTF8_UNICODE_CI NOT NULL,
    `code2` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `code3` VARCHAR(3) COLLATE UTF8_UNICODE_CI NOT NULL,
    `numeric_code` VARCHAR(3) COLLATE UTF8_UNICODE_CI NOT NULL,
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    `delete_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE=UTF8_UNICODE_CI;

--
-- Dumping data for table `country`
--

LOCK TABLES `country` WRITE;
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Afghanistan", "AF", "AFG", "004");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Åland Islands", "AX", "ALA", "248");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Albania", "AL", "ALB", "008");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Algeria", "DZ", "DZA", "012");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("American Samoa", "AS", "ASM", "016");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Andorra", "AD", "AND", "020");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Angola", "AO", "AGO", "024");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Anguilla", "AI", "AIA", "660");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Antarctica", "AQ", "ATA", "010");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Antigua and Barbuda", "AG", "ATG", "028");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Argentina", "AR", "ARG", "032");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Armenia", "AM", "ARM", "051");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Aruba", "AW", "ABW", "533");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Australia", "AU", "AUS", "036");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Austria", "AT", "AUT", "040");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Azerbaijan", "AZ", "AZE", "031");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bahamas", "BS", "BHS", "044");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bahrain", "BH", "BHR", "048");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bangladesh", "BD", "BGD", "050");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Barbados", "BB", "BRB", "052");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Belarus", "BY", "BLR", "112");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Belgium", "BE", "BEL", "056");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Belize", "BZ", "BLZ", "084");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Benin", "BJ", "BEN", "204");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bermuda", "BM", "BMU", "060");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bhutan", "BT", "BTN", "064");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bolivia, Plurinational State of", "BO", "BOL", "068");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bonaire, Sint Eustatius and Saba[c]", "BQ", "BES", "535");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bosnia and Herzegovina", "BA", "BIH", "070");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Botswana", "BW", "BWA", "072");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bouvet Island", "BV", "BVT", "074");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Brazil", "BR", "BRA", "076");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("British Indian Ocean Territory", "IO", "IOT", "086");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Brunei Darussalam", "BN", "BRN", "096");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Bulgaria", "BG", "BGR", "100");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Burkina Faso", "BF", "BFA", "854");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Burundi", "BI", "BDI", "108");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cabo Verde", "CV", "CPV", "132");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cambodia", "KH", "KHM", "116");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cameroon", "CM", "CMR", "120");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Canada", "CA", "CAN", "124");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cayman Islands", "KY", "CYM", "136");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Central African Republic", "CF", "CAF", "140");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Chad", "TD", "TCD", "148");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Chile", "CL", "CHL", "152");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("China[b]", "CN", "CHN", "156");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Christmas Island", "CX", "CXR", "162");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cocos (Keeling) Islands", "CC", "CCK", "166");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Colombia", "CO", "COL", "170");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Comoros", "KM", "COM", "174");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Congo", "CG", "COG", "178");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Congo, Democratic Republic of the", "CD", "COD", "180");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cook Islands", "CK", "COK", "184");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Costa Rica", "CR", "CRI", "188");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Côte d'Ivoire", "CI", "CIV", "384");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Croatia", "HR", "HRV", "191");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cuba", "CU", "CUB", "192");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Curaçao", "CW", "CUW", "531");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Cyprus[b]", "CY", "CYP", "196");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Czechia", "CZ", "CZE", "203");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Denmark", "DK", "DNK", "208");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Djibouti", "DJ", "DJI", "262");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Dominica", "DM", "DMA", "212");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Dominican Republic", "DO", "DOM", "214");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Ecuador", "EC", "ECU", "218");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Egypt", "EG", "EGY", "818");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("El Salvador", "SV", "SLV", "222");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Equatorial Guinea", "GQ", "GNQ", "226");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Eritrea", "ER", "ERI", "232");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Estonia", "EE", "EST", "233");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Eswatini", "SZ", "SWZ", "748");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Ethiopia", "ET", "ETH", "231");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Falkland Islands (Malvinas)[b]", "FK", "FLK", "238");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Faroe Islands", "FO", "FRO", "234");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Fiji", "FJ", "FJI", "242");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Finland", "FI", "FIN", "246");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("France", "FR", "FRA", "250");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("French Guiana", "GF", "GUF", "254");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("French Polynesia", "PF", "PYF", "258");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("French Southern Territories", "TF", "ATF", "260");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Gabon", "GA", "GAB", "266");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Gambia", "GM", "GMB", "270");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Georgia", "GE", "GEO", "268");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Germany", "DE", "DEU", "276");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Ghana", "GH", "GHA", "288");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Gibraltar", "GI", "GIB", "292");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Greece", "GR", "GRC", "300");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Greenland", "GL", "GRL", "304");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Grenada", "GD", "GRD", "308");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guadeloupe", "GP", "GLP", "312");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guam", "GU", "GUM", "316");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guatemala", "GT", "GTM", "320");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guernsey", "GG", "GGY", "831");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guinea", "GN", "GIN", "324");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guinea-Bissau", "GW", "GNB", "624");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Guyana", "GY", "GUY", "328");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Haiti", "HT", "HTI", "332");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Heard Island and McDonald Islands", "HM", "HMD", "334");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Holy See", "VA", "VAT", "336");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Honduras", "HN", "HND", "340");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Hong Kong", "HK", "HKG", "344");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Hungary", "HU", "HUN", "348");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Iceland", "IS", "ISL", "352");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("India", "IN", "IND", "356");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Indonesia", "ID", "IDN", "360");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Iran, Islamic Republic of", "IR", "IRN", "364");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Iraq", "IQ", "IRQ", "368");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Ireland", "IE", "IRL", "372");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Isle of Man", "IM", "IMN", "833");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Israel", "IL", "ISR", "376");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Italy", "IT", "ITA", "380");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Jamaica", "JM", "JAM", "388");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Japan", "JP", "JPN", "392");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Jersey", "JE", "JEY", "832");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Jordan", "JO", "JOR", "400");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Kazakhstan", "KZ", "KAZ", "398");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Kenya", "KE", "KEN", "404");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Kiribati", "KI", "KIR", "296");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Korea, Democratic People's Republic of", "KP", "PRK", "408");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Korea, Republic of", "KR", "KOR", "410");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Kuwait", "KW", "KWT", "414");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Kyrgyzstan", "KG", "KGZ", "417");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Lao People's Democratic Republic", "LA", "LAO", "418");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Latvia", "LV", "LVA", "428");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Lebanon", "LB", "LBN", "422");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Lesotho", "LS", "LSO", "426");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Liberia", "LR", "LBR", "430");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Libya", "LY", "LBY", "434");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Liechtenstein", "LI", "LIE", "438");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Lithuania", "LT", "LTU", "440");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Luxembourg", "LU", "LUX", "442");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Macao", "MO", "MAC", "446");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Madagascar", "MG", "MDG", "450");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Malawi", "MW", "MWI", "454");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Malaysia", "MY", "MYS", "458");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Maldives", "MV", "MDV", "462");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mali", "ML", "MLI", "466");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Malta", "MT", "MLT", "470");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Marshall Islands", "MH", "MHL", "584");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Martinique", "MQ", "MTQ", "474");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mauritania", "MR", "MRT", "478");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mauritius", "MU", "MUS", "480");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mayotte", "YT", "MYT", "175");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mexico", "MX", "MEX", "484");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Micronesia, Federated States of", "FM", "FSM", "583");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Moldova, Republic of", "MD", "MDA", "498");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Monaco", "MC", "MCO", "492");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mongolia", "MN", "MNG", "496");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Montenegro", "ME", "MNE", "499");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Montserrat", "MS", "MSR", "500");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Morocco", "MA", "MAR", "504");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Mozambique", "MZ", "MOZ", "508");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Myanmar", "MM", "MMR", "104");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Namibia", "NA", "NAM", "516");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Nauru", "NR", "NRU", "520");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Nepal", "NP", "NPL", "524");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Netherlands, Kingdom of the", "NL", "NLD", "528");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("New Caledonia", "NC", "NCL", "540");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("New Zealand", "NZ", "NZL", "554");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Nicaragua", "NI", "NIC", "558");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Niger", "NE", "NER", "562");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Nigeria", "NG", "NGA", "566");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Niue", "NU", "NIU", "570");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Norfolk Island", "NF", "NFK", "574");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("North Macedonia", "MK", "MKD", "807");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Northern Mariana Islands", "MP", "MNP", "580");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Norway", "NO", "NOR", "578");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Oman", "OM", "OMN", "512");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Pakistan", "PK", "PAK", "586");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Palau", "PW", "PLW", "585");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Palestine, State of[b]", "PS", "PSE", "275");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Panama", "PA", "PAN", "591");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Papua New Guinea", "PG", "PNG", "598");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Paraguay", "PY", "PRY", "600");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Peru", "PE", "PER", "604");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Philippines", "PH", "PHL", "608");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Pitcairn", "PN", "PCN", "612");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Poland", "PL", "POL", "616");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Portugal", "PT", "PRT", "620");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Puerto Rico", "PR", "PRI", "630");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Qatar", "QA", "QAT", "634");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Réunion", "RE", "REU", "638");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Romania", "RO", "ROU", "642");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Russian Federation", "RU", "RUS", "643");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Rwanda", "RW", "RWA", "646");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Barthélemy", "BL", "BLM", "652");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Helena, Ascension and Tristan da Cunha[d]", "SH", "SHN", "654");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Kitts and Nevis", "KN", "KNA", "659");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Lucia", "LC", "LCA", "662");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Martin (French part)", "MF", "MAF", "663");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Pierre and Miquelon", "PM", "SPM", "666");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saint Vincent and the Grenadines", "VC", "VCT", "670");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Samoa", "WS", "WSM", "882");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("San Marino", "SM", "SMR", "674");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Sao Tome and Principe", "ST", "STP", "678");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Saudi Arabia", "SA", "SAU", "682");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Senegal", "SN", "SEN", "686");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Serbia", "RS", "SRB", "688");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Seychelles", "SC", "SYC", "690");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Sierra Leone", "SL", "SLE", "694");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Singapore", "SG", "SGP", "702");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Sint Maarten (Dutch part)", "SX", "SXM", "534");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Slovakia", "SK", "SVK", "703");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Slovenia", "SI", "SVN", "705");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Solomon Islands", "SB", "SLB", "090");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Somalia", "SO", "SOM", "706");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("South Africa", "ZA", "ZAF", "710");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("South Georgia and the South Sandwich Islands", "GS", "SGS", "239");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("South Sudan", "SS", "SSD", "728");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Spain", "ES", "ESP", "724");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Sri Lanka", "LK", "LKA", "144");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Sudan", "SD", "SDN", "729");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Suriname", "SR", "SUR", "740");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Svalbard and Jan Mayen[e]", "SJ", "SJM", "744");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Sweden", "SE", "SWE", "752");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Switzerland", "CH", "CHE", "756");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Syrian Arab Republic", "SY", "SYR", "760");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Taiwan, Province of China[b]", "TW", "TWN", "158");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Tajikistan", "TJ", "TJK", "762");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Tanzania, United Republic of", "TZ", "TZA", "834");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Thailand", "TH", "THA", "764");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Timor-Leste", "TL", "TLS", "626");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Togo", "TG", "TGO", "768");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Tokelau", "TK", "TKL", "772");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Tonga", "TO", "TON", "776");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Trinidad and Tobago", "TT", "TTO", "780");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Tunisia", "TN", "TUN", "788");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Türkiye", "TR", "TUR", "792");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Turkmenistan", "TM", "TKM", "795");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Turks and Caicos Islands", "TC", "TCA", "796");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Tuvalu", "TV", "TUV", "798");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Uganda", "UG", "UGA", "800");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Ukraine", "UA", "UKR", "804");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("United Arab Emirates", "AE", "ARE", "784");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("United Kingdom of Great Britain and Northern Ireland", "GB", "GBR", "826");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("United States Minor Outlying Islands[f]", "UM", "UMI", "581");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("United States of America", "US", "USA", "840");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Uruguay", "UY", "URY", "858");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Uzbekistan", "UZ", "UZB", "860");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Vanuatu", "VU", "VUT", "548");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Venezuela, Bolivarian Republic of", "VE", "VEN", "862");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Viet Nam", "VN", "VNM", "704");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Virgin Islands (British)", "VG", "VGB", "092");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Virgin Islands (U.S.)", "VI", "VIR", "850");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Wallis and Futuna", "WF", "WLF", "876");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Western Sahara[b]", "EH", "ESH", "732");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Yemen", "YE", "YEM", "887");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Zambia", "ZM", "ZMB", "894");
INSERT INTO `country` (name, code2, code3, numeric_code) VALUES("Zimbabwe", "ZW", "ZWE", "716");
UNLOCK TABLES;



--
-- Table structure for table `datatypes`
--

DROP TABLE IF EXISTS `datatypes`;
CREATE TABLE `datatypes`(
    `id` INT(12) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) COLLATE UTF8_UNICODE_CI NOT NULL,
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    `delete_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE=UTF8_UNICODE_CI;

--
-- Dumping data for table `datatypes`
--

LOCK TABLES `datatypes` WRITE;
INSERT INTO `datatypes` (name) VALUES("RealTime");
INSERT INTO `datatypes` (name) VALUES("History");
UNLOCK TABLES;



--
-- Table structure for table `timeunits`
--

DROP TABLE IF EXISTS `timeunits`;
CREATE TABLE `timeunits`(
    `id` INT(12) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) COLLATE UTF8_UNICODE_CI NOT NULL,
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    `delete_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE=UTF8_UNICODE_CI;

--
-- Dumping data for table `timeunits`
--

LOCK TABLES `timeunits` WRITE;
INSERT INTO `timeunits` (name) VALUES("Hour");
UNLOCK TABLES;



--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
CREATE TABLE `schedules`(
    `id` INT(12) NOT NULL AUTO_INCREMENT,
    `schedule_name` VARCHAR(256) COLLATE UTF8_UNICODE_CI NOT NULL,
    `datatype_id` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `minute` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `hour` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `day` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `month` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `week` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL,
    `taskstatus_id` VARCHAR(2) COLLATE UTF8_UNICODE_CI NOT NULL DEFAULT 1,
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    `delete_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE=UTF8_UNICODE_CI;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
INSERT INTO `schedules` (schedule_name, datatype_id, minute, hour, day, month, week) VALUES("test", 1, "*", "*", "*", "*", "*");
UNLOCK TABLES;



--
-- Table structure for table `taskstatus`
--

DROP TABLE IF EXISTS `taskstatus`;
CREATE TABLE `taskstatus`(
    `id` INT(12) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(64) COLLATE UTF8_UNICODE_CI NOT NULL,
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    `delete_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE=UTF8_UNICODE_CI;

--
-- Dumping data for table `taskstatus`
--

LOCK TABLES `taskstatus` WRITE;
INSERT INTO `taskstatus` (name) VALUES("Start");
INSERT INTO `taskstatus` (name) VALUES("Stop");
UNLOCK TABLES;



--
-- Table structure for table `privacypolicies`
--

DROP TABLE IF EXISTS `privacypolicies`;
CREATE TABLE `privacypolicies`(
    `id` INT(12) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(64) COLLATE UTF8_UNICODE_CI NOT NULL,
    `contents` VARCHAR(4096) COLLATE UTF8_UNICODE_CI NOT NULL,
    `create_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `update_date` DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ON UPDATE CURRENT_TIMESTAMP,
    `delete_date` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB DEFAULT CHARSET=UTF8 COLLATE=UTF8_UNICODE_CI;

--
-- Dumping data for table `privacypolicies`
--

LOCK TABLES `privacypolicies` WRITE;
INSERT INTO `privacypolicies` (title, contents) VALUES("title","privacypolicies");
UNLOCK TABLES;
