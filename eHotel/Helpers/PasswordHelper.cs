using System;
using System.Security.Cryptography;

namespace eHotel.Helpers
{
    public static class PasswordHelper
    {
        public static string Hash(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            byte[] salt = new byte[16];
            rng.GetBytes(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
            byte[] hash = pbkdf2.GetBytes(20);
            byte[] hashWithSalt = new byte[36];
            Array.Copy(salt, 0, hashWithSalt, 0, 16);
            Array.Copy(hash, 0, hashWithSalt, 16, 20);
            return Convert.ToBase64String(hashWithSalt);
        }

        public static bool Verify(string password, string hash)
        {
            try
            {
                byte[] hashWithSalt = Convert.FromBase64String(hash);
                byte[] salt = new byte[16];
                Array.Copy(hashWithSalt, 0, salt, 0, 16);

                using var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256);
                byte[] newHash = pbkdf2.GetBytes(20);

                for (int i = 0; i < 20; i++)
                    if (hashWithSalt[i + 16] != newHash[i])
                        return false;

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
