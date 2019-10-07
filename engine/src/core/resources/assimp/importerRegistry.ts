import { BaseImporter } from "./baseImporter";
import { ObjFileImporter } from "./importers/Obj/objFileImporter";

export function GetImporterInstanceList(out: Array<BaseImporter>): void {
    out.push(new ObjFileImporter());
}