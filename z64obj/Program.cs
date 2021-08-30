using System;
using System.IO;
using System.Diagnostics;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace z64obj
{
    class Program
    {
        static void Main(string[] args)
        {
            byte[] baseROM = File.ReadAllBytes(args[0]);
            JObject zobjJSON = JObject.Parse(File.ReadAllText(args[1]));

            Extract(baseROM, zobjJSON);

            Console.ReadKey();
        }

        static void Extract(byte[] src, JObject json)
        {
            bool toBeExtracted = Convert.ToBoolean(json["objectDetails"]["extractFromROM"]);
            if (toBeExtracted)
            {
                Console.WriteLine($"Extracting {json["objectDetails"]["fileName"]}...");
                int vROMStart = Convert.ToInt32($"{json["objectDetails"]["vromStartAddress"]}", 16);
                int vROMEnd = Convert.ToInt32($"{json["objectDetails"]["vromEndAddress"]}", 16);
                int size = vROMEnd - vROMStart;

                byte[] extractedFile = new byte[size];
                for (int i = vROMStart; i < vROMStart + size; i++)
                {
                    extractedFile[i - vROMStart] = src[i];
                }

                if (extractedFile.Length > 0)
                {
                    using (BinaryWriter bw = new BinaryWriter(File.Create($"{json["objectDetails"]["fileName"]}")))
                    {
                        bw.Write(extractedFile);
                    }
                    Console.WriteLine("Extracted file!");
                }
            }
            else
            {
                Console.WriteLine("Token \"extractFromROM\" is false--nothing to be extracted.");
            }
        }
    }
}
