import { __awaiter } from "tslib";
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/member-ordering */
import { Enumerable, StringUtil, StringBuilder } from "@brandless/tsutility";
import { cwd } from "process";
import * as fs from "fs";
import * as path from "path";
class Path {
    static GetDirectoryName(name) {
        return path.dirname(name);
    }
    static GetFileName(name) {
        return path.basename(name);
    }
    static GetFileNameWithoutExtension(name) {
        return path.parse(name).name;
    }
    static GetFullPath(dir, basePath) {
        return path.resolve(basePath, dir);
    }
    static Combine(...names) {
        return path.join(...names);
    }
}
Path.DirectorySeparatorChar = '\\';
class Directory {
    static CreateDirectory(name) {
        if (!fs.existsSync(name)) {
            fs.mkdirSync(name, { recursive: true });
        }
    }
    static EnumerateDirectories(source, filter) {
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(source, dirent.name));
    }
    static EnumerateFiles(source, filter) {
        if (filter != null) {
            while (filter.startsWith("*")) {
                filter = filter.substr(1);
            }
        }
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isFile())
            .filter(dirent => filter == null || dirent.name.toLowerCase().endsWith(filter.toLowerCase()))
            .map(dirent => path.join(source, dirent.name));
    }
    static Exists(name) {
        return fs.existsSync(name);
    }
}
class File {
    static WriteAllTextAsync(name, contents) {
        return new Promise(resolver => {
            fs.writeFile(name, contents, (err) => resolver(null));
        });
    }
    static Exists(name) {
        return fs.existsSync(name);
    }
    static Delete(name) {
        fs.unlinkSync(name);
    }
    static ReadAllText(name) {
        return fs.readFileSync(name, "utf-8");
    }
    static ReadAllTextAsync(name) {
        return new Promise(resolver => {
            fs.readFile(name, "utf-8", (err, data) => resolver(data));
        });
    }
}
class StringComparer {
    static CompareIgnoreCase(left, right) {
        return left.toLowerCase() === right.toLowerCase();
    }
}
export class Exporter {
    constructor() {
        this.Exports = [];
        this.ExistingIndexFiles = [];
        this.RootFile = `ng-package.json`;
    }
    WriteAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < this.ExistingIndexFiles.length; i++) {
                const file = this.ExistingIndexFiles[i];
                // Idempotency
                if ((File.Exists(file))) {
                    File.Delete(file);
                }
            }
            for (let i = 0; i < this.Exports.length; i++) {
                const $export = this.Exports[i];
                yield $export.WriteAsync();
            }
        });
    }
    ParseAsync(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ParseInternalAsync(folder);
            for (let i = 0; i < this.Exports.length; i++) {
                const $export = this.Exports[i];
                this.CheckExport($export, folder);
            }
        });
    }
    CheckExport($export, folder) {
        const CanPatch = (path) => !(this.IsRoot(path));
        if (!(CanPatch($export.Folder))) {
            return;
        }
        if ($export.From != null && !(StringComparer.CompareIgnoreCase($export.From, $export.Folder))) {
            return;
        }
        if (((($export.Items).length > 0))) {
            const parent = (Path.GetDirectoryName($export.Folder));
            if (parent.length < folder.length) {
                return;
            }
            if (!(CanPatch(parent))) {
                return;
            }
            if (StringComparer.CompareIgnoreCase(parent, folder)) {
                return;
            }
            const parentExport = this.EnsureExport(parent);
            if (!(((parentExport.Items).filter(_ => (StringComparer.CompareIgnoreCase(_.Path, $export.Folder))).length > 0))) {
                parentExport.Items.push(new ExportItem($export.Folder, ExportItemKind.Module));
            }
            this.CheckExport(parentExport, folder);
        }
    }
    EnsureExport(folder) {
        let $export = Enumerable.SingleOrDefault(this.Exports, _ => (StringComparer.CompareIgnoreCase(_.Folder, folder)));
        if ($export == null) {
            $export = new Export(this, folder);
            this.Exports.push($export);
        }
        return $export;
    }
    FindRoot(folder) {
        let root = folder;
        while (!(this.IsRoot(root))) {
            root = (Path.GetDirectoryName(root));
        }
        return (root);
    }
    IsRoot(folder) {
        return (File.Exists((Path.Combine(folder, this.RootFile))));
    }
    HasName(file, name) {
        return StringComparer.CompareIgnoreCase(Path.GetFileNameWithoutExtension(file), name);
    }
    ParseInternalAsync(folder) {
        return __awaiter(this, void 0, void 0, function* () {
            if (((Path.GetFileName(folder)).toLowerCase()) == `coverage`) {
                return (false);
            }
            const exports = new Array();
            if (!(this.IsRoot(folder))) {
                const MakeFullPath = (p) => (Path.Combine(folder, p));
                for (let i = 0, files = Directory.EnumerateFiles(folder, `*.ts`); i < files.length; i++) {
                    const file = files[i];
                    if ((this.HasName(file, `index`)) || (this.HasName(file, `public_api`))) {
                        this.ExistingIndexFiles.push(file);
                        continue;
                    }
                    if (((file.toLowerCase()).endsWith(`.spec.ts`))) {
                        continue;
                    }
                    const matches = (new RegExp(`export\\s+(declare\\s+){0,1}(abstract\\s+){0,1}(const|type|enum|class|interface|function)\\s+(?<Name>[A-z0-9_]*?)\\s*({|<|\\b|$| |\\()`, `g`).test(yield File.ReadAllTextAsync(file)));
                    if (matches) {
                        exports.push(new ExportItem((MakeFullPath((Path.GetFileName((Path.GetFileNameWithoutExtension(file)))))), ExportItemKind.File));
                    }
                }
                for (let i = 0, subFolders = Directory.EnumerateDirectories(folder, `*`); i < subFolders.length; i++) {
                    const subFolder = subFolders[i];
                    yield this.ParseInternalAsync(subFolder);
                }
                const internalTs = (Path.Combine(folder, `internal.ts`));
                if ((File.Exists(internalTs))) {
                    const internalTsContent = yield File.ReadAllTextAsync(internalTs);
                    const matches = Enumerable.Cast((() => {
                        const r = new RegExp(`from\\s+("|')(?<Name>.*?)("|')`, `g`);
                        let m = null;
                        const all = new Array();
                        do {
                            m = r.exec(internalTsContent);
                            if (m) {
                                all.push(m);
                            }
                        } while (m);
                        return all;
                    })());
                    for (let i = 0; i < matches.length; i++) {
                        const m = matches[i];
                        let path = m["groups"][`Name`];
                        path = (Path.GetFullPath(path, folder));
                        Enumerable.ToList(exports.filter(_ => (StringComparer.CompareIgnoreCase(_.Path, path)))).forEach(_ => _.Internal = true);
                    }
                }
                const $export = this.EnsureExport(folder);
                const rc = (Path.Combine(folder, `.exportrc.json`));
                if ((File.Exists(rc))) {
                    const exportRc = JSON.parse((File.ReadAllText(rc)));
                    $export.Rc = exportRc;
                }
                $export.Items.push(...exports);
            }
            else {
                const $export = this.EnsureExport(folder);
                for (let i = 0, subFolders = Directory.EnumerateDirectories(folder, `*`); i < subFolders.length; i++) {
                    const subFolder = subFolders[i];
                    if (yield this.ParseInternalAsync(subFolder)) {
                        $export.Items.push(new ExportItem(subFolder, ExportItemKind.Module));
                    }
                }
            }
            return (exports.length > 0);
        });
    }
}
export class ExportItem {
    constructor(path, kind) {
        this.Internal = false;
        if (kind == ExportItemKind.File) {
            if (!(File.Exists(path)) && !(File.Exists(path + `.ts`))) {
                throw new Error();
            }
        }
        else {
            if (!(Directory.Exists(path))) {
                throw new Error();
            }
        }
        this.Path = path;
        this.Kind = kind;
    }
}
export class Export {
    constructor(exporter, folder) {
        this.exporter = exporter;
        this.Items = [];
        this.Folder = folder;
    }
    get From() {
        if (!(StringUtil.IsNullOrWhiteSpace(this.Rc.from))) {
            return (Path.Combine((this.exporter.FindRoot(this.Folder)), (StringUtil.TrimStart((StringUtil.Replace(this.Rc.from, '/'.charCodeAt(0), '\\'.charCodeAt(0))), '\\'.charCodeAt(0)))));
        }
        return null;
    }
    ToExports(exports, makeRelative) {
        const filtered = exports.slice()
            .filter(_ => !this.IsExcluded(_));
        return (Enumerable.Select(filtered, _ => `export * from \"${(makeRelative ? (Export.GetRelativePath(_, this.Folder)) : _)}\";`).join(`\n`));
    }
    IsExcluded(name) {
        var _a, _b;
        name = path.basename(name);
        return ((_b = (_a = this.Rc) === null || _a === void 0 ? void 0 : _a.exclude) === null || _b === void 0 ? void 0 : _b.filter(_ => _.toLowerCase() === name.toLowerCase()).length) > 0;
    }
    static GetRelativePath(filespec, folder) {
        let result = path.relative(folder, filespec);
        while (result.indexOf('\\') !== -1) {
            result = result.replace('\\', '/');
        }
        if (!(result.startsWith(`/`)) && !(result.startsWith(`.`))) {
            result = `/${result}`;
        }
        if (!(result.startsWith(`.`))) {
            result = `.${result}`;
        }
        return (result);
    }
    Build($internal) {
        const items = Enumerable.ToList(this.Items.filter(_ => _.Internal == $internal || $internal == true));
        const files = Enumerable.ToList(Enumerable.OrderBy(items.filter(_ => _.Kind == ExportItemKind.File), _ => _.Path));
        const modules = Enumerable.ToList(Enumerable.OrderBy(items.filter(_ => _.Kind == ExportItemKind.Module), _ => _.Path));
        const indexTs = new StringBuilder();
        if ((((items).length > 0)) || ($internal == true && (((this.Items).filter(_ => _.Internal == false).length > 0)))) {
            if (modules.length > 0) {
                indexTs.AppendLine(`// Modules`);
                indexTs.AppendLine((this.ToExports(Enumerable.Select(modules, _ => $internal ? _.Path : (Path.Combine(_.Path, `public_api`))), true)));
            }
            if (files.length > 0) {
                indexTs.AppendLine(`// Files`);
                indexTs.AppendLine((this.ToExports(Enumerable.Select(files, _ => _.Path), true)));
            }
            const contents = ((indexTs.toString()).trim());
            return this.FinaliseFileContents(contents);
        }
        return null;
    }
    WriteAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.WriteAsyncInternal(`public_api.ts`, (this.Build(false)));
            yield this.WriteAsyncInternal(`index.ts`, (this.Build(true)));
        });
    }
    WriteAsyncInternal(path, content) {
        return __awaiter(this, void 0, void 0, function* () {
            const fullPath = (Path.Combine(this.Folder, path));
            if ((StringUtil.IsNullOrWhiteSpace(content))) {
                return;
            }
            if (!(Directory.Exists(this.Folder))) {
                Directory.CreateDirectory(this.Folder);
            }
            yield File.WriteAllTextAsync(fullPath, content);
            if (path == `public_api.ts` && !(StringUtil.IsNullOrWhiteSpace(this.From)) && !(StringComparer.CompareIgnoreCase(this.From, this.Folder))) {
                if (!(Directory.Exists(this.From))) {
                    Directory.CreateDirectory(this.From);
                }
                const relativePath = (StringUtil.Replace((Path.Combine((Export.GetRelativePath(this.Folder, this.From)), `public_api`)), '\\'.charCodeAt(0), '/'.charCodeAt(0)));
                const filePath = (Path.Combine(this.From, `index.ts`));
                const contents = this.ToExports([relativePath], false);
                yield File.WriteAllTextAsync(filePath, this.FinaliseFileContents(contents));
            }
        });
    }
    FinaliseFileContents(contents) {
        return `${contents}\n`;
    }
}
export class ExportRc {
}
export var ExportItemKind;
(function (ExportItemKind) {
    ExportItemKind[ExportItemKind["Module"] = 0] = "Module";
    ExportItemKind[ExportItemKind["File"] = 1] = "File";
})(ExportItemKind || (ExportItemKind = {}));
const args = process.argv.slice(2);
let dir = args.length > 0 ? args[0] : cwd();
if (!path.isAbsolute(dir)) {
    dir = path.join(cwd(), dir);
}
const exporter = new Exporter();
console.log(dir);
exporter.ParseAsync(dir).then(() => {
    // for (const ex of exporter.Exports) {
    //     console.log("Folder: " + ex.Folder);
    //     for (const c of ex.Items) {
    //         console.log("Export: " + c.Path + " - " + c.Kind);
    //     }
    // }
    exporter.WriteAsync().then(() => {
        console.log("Done");
    });
});
