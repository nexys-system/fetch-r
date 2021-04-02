// mimic checksum done by flyway
// see https://stackoverflow.com/questions/43267202/flyway-the-meaning-of-the-concept-of-checksums
// see https://www.npmjs.com/package/crc-32
import CRC32 from "crc-32";

test("checksum", () => {
  const cs = -1064643516;
  const s =
    "CREATE TABLE `user` (`id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, `uuid` VARCHAR(64) NOT NULL, `first_name` VARCHAR(512) NOT NULL, `last_name` VARCHAR(512) NOT NULL, `email` VARCHAR(512) NOT NULL, `status_id` BIGINT NOT NULL, `log_date_added` DATETIME NOT NULL DEFAULT NOW(), `instance_id` BIGINT NOT NULL, `lang` VARCHAR(512) NOT NULL);";
  expect(CRC32.str(s)).toEqual(cs);
});
