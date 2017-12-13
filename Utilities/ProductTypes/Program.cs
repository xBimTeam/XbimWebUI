using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xbim.Common.Metadata;
using Xbim.Ifc4.Kernel;

namespace ProductTypes
{
    class Program
    {
        static void Main(string[] args)
        {
            var metadata = ExpressMetaData.GetMetadata(typeof(IfcProduct).Module);
            var productType = metadata.ExpressType(typeof(IfcProduct));
            var productTypes = productType.AllSubTypes.ToList();

            using (var w = File.CreateText("product-type.ts"))
            {
                w.WriteLine("/**");
                w.WriteLine(" * Enumeration of product types.");
                w.WriteLine(" * @readonly");
                w.WriteLine(" * @enum {number}");
                w.WriteLine(" */");

                w.WriteLine("export enum ProductType {");
                w.WriteLine($"    {productType.ExpressNameUpper} = {productType.TypeId},");
                productTypes.ForEach(p => {
                    w.WriteLine($"    {p.ExpressNameUpper} = {p.TypeId},");
                });
                w.WriteLine("}");

            }
        }
    }
}
