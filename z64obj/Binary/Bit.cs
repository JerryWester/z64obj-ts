using System;

namespace N64GL.Binary
{
    public class Bit
    {
        public static Boolean Test(dynamic store, dynamic bit)
        {
            return Convert.ToBoolean((store & bit) != 0);
        }
        public static void Set(dynamic store, dynamic bit)
        {
            store |= bit;
        }
        public static void Clear(dynamic store, dynamic bit)
        {
            store &= ~bit;
        }
        public static void Toggle(dynamic store, dynamic bit)
        {
            store ^= bit;
        }
    }
}
