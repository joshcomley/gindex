/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/member-ordering */
import { Enumerable, StringUtil, StringBuilder } from "@brandless/tsutility";
import { cwd } from "process";
import * as fs from "fs";
import * as path from "path";

class Path {
    public static DirectorySeparatorChar = '\\';
    public static GetDirectoryName(name: string): string {
        return path.dirname(name);
    }
    public static GetFileName(name: string): string {
        return path.basename(name);
    }
    public static GetFileNameWithoutExtension(name: string): string {
        return path.parse(name).name
    }
    public static GetFullPath(dir: string, basePath: string): string {
        return path.resolve(basePath, dir);
    }
    public static Combine(...names: string[]): string {
        return path.join(...names);
    }
}

class Directory {
    public static CreateDirectory(name: string) {
        if (!fs.existsSync(name)) {
            fs.mkdirSync(name, { recursive: true });
        }
    }
    public static EnumerateDirectories(source: string, filter: string): string[] {
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(source, dirent.name));
    }
    public static EnumerateFiles(source: string, filter: string): string[] {
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
    public static Exists(name: string): boolean {
        return fs.existsSync(name);
    }
}
class File {
    public static WriteAllTextAsync(name: string, contents: string): Promise<any> {
        return new Promise<string>(resolver => {
            fs.writeFile(name, contents, (err) => resolver(null));
        });
    }
    public static Exists(name: string): boolean {
        return fs.existsSync(name);
    }
    public static Delete(name: string): void {
        fs.unlinkSync(name);
    }
    public static ReadAllText(name: string): string {
        return fs.readFileSync(name, "utf-8");
    }
    public static ReadAllTextAsync(name: string): Promise<string> {
        return new Promise<string>(resolver => {
            fs.readFile(name, "utf-8", (err, data) => resolver(data));
        });
    }
}
class StringComparer {
    public static CompareIgnoreCase(left: string, right: string) {
        return left.toLowerCase() === right.toLowerCase();
    }
}
export class Exporter {
    public Exports: Array<Export> = [];
    public ExistingIndexFiles: Array<string> = [];
    public RootFile: string = `ng-package.json`;
    public async WriteAsync(): Promise<any> {
        for (
            let file_index_ = 0, file_source_ = this.ExistingIndexFiles; file_index_ < file_source_.length; file_index_++) {
            let file = file_source_[file_index_];
            // Idempotency
            if ((<boolean>(File.Exists(file)))) {
                File.Delete(file);
            }
        }
        for (
            let export_index_ = 0, export_source_ = this.Exports; export_index_ < export_source_.length; export_index_++) {
            let $export = export_source_[export_index_];
            await $export.WriteAsync();
        }
    }
    public async ParseAsync(folder: string | null): Promise<any> {
        await this.ParseInternalAsync(folder);
        for (
            let export_index_ = 0, export_source_ = Enumerable.ToList(this.Exports); export_index_ < export_source_.length; export_index_++) {
            let $export = export_source_[export_index_];
            this.CheckExport($export, folder);
        }
    }
    public CheckExport($export: Export | null, folder: string | null): void {
        let CanPatch = (path: string | null): boolean => !(<boolean>(this.IsRoot(path)));
        if (!(<boolean>(CanPatch($export.Folder)))) {
            return;
        }
        if ($export.From != null && !(<boolean>(StringComparer.CompareIgnoreCase($export.From, $export.Folder)))) {
            return;
        }
        if ((<boolean>((($export.Items).length > 0)))) {
            let parent = (<string>(Path.GetDirectoryName($export.Folder)));
            if (parent.length < folder.length) {
                return;
            }
            if (!(<boolean>(CanPatch(parent)))) {
                return;
            }
            if (StringComparer.CompareIgnoreCase(parent, folder)) {
                return;
            }
            let parentExport = this.EnsureExport(parent);
            if (!(<boolean>(((parentExport.Items).filter(_ => (<boolean>(StringComparer.CompareIgnoreCase(_.Path, $export.Folder)))).length > 0)))) {
                parentExport.Items.push(new ExportItem($export.Folder, ExportItemKind.Module));
            }
            this.CheckExport(parentExport, folder);
        }
    }
    public EnsureExport(folder: string | null): Export | null {
        let $export = Enumerable.SingleOrDefault(this.Exports, _ => (<boolean>(StringComparer.CompareIgnoreCase(_.Folder, folder))));
        if ($export == <any>null) {
            $export = new Export(folder);
            this.Exports.push($export);
        }
        return $export;
    }
    private FindRoot(folder: string | null): string | null {
        let root = folder;
        while (!(<boolean>(this.IsRoot(root)))) {
            root = (<string>(Path.GetDirectoryName(root)));
        }
        return (<string>(root));
    }
    private IsRoot(folder: string | null): boolean {
        return (<boolean>((<boolean>(File.Exists((<string>(Path.Combine(folder, this.RootFile))))))));
    }
    private HasName(file: string | null, name: string | null): boolean {
        return StringComparer.CompareIgnoreCase(Path.GetFileNameWithoutExtension(file), name);
    }
    async ParseInternalAsync(folder: string | null): Promise<boolean> {
        if ((<string>((<string>(Path.GetFileName(folder))).toLowerCase())) == `coverage`) {
            return (<boolean>(false));
        }
        let exports = new Array<ExportItem>();
        if (!(<boolean>(this.IsRoot(folder)))) {
            let MakeFullPath = (p: string | null): string => (<string>((<string>(Path.Combine(folder, p)))))
            for (
                let i = 0, files = Directory.EnumerateFiles(folder, `*.ts`); i < files.length; i++) {
                let file = files[i];
                if ((<boolean>(this.HasName(file, `index`))) || (<boolean>(this.HasName(file, `public_api`)))) {
                    this.ExistingIndexFiles.push(file);
                    continue;
                }
                if ((<boolean>((<string>(file.toLowerCase())).endsWith(`.spec.ts`)))) {
                    continue;
                }
                let matches = (<boolean>(new RegExp(`export\\s+(declare\\s+){0,1}(abstract\\s+){0,1}(const|type|enum|class|interface|function)\\s+(?<Name>[A-z0-9_]*?)\\s*({|<|\\b|$| |\\()`, `g`).test(await File.ReadAllTextAsync(file))));
                if (matches) {
                    exports.push(new ExportItem((<string>(MakeFullPath((<string>(Path.GetFileName((<string>(Path.GetFileNameWithoutExtension(file))))))))), ExportItemKind.File));
                }
            }
            for (
                let i = 0, subFolders = Directory.EnumerateDirectories(folder, `*`); i < subFolders.length; i++) {
                let subFolder = subFolders[i];
                await this.ParseInternalAsync(subFolder);
            }
            let internalTs = (<string>(Path.Combine(folder, `internal.ts`)));
            if ((<boolean>(File.Exists(internalTs)))) {
                let internalTsContent = await File.ReadAllTextAsync(internalTs);
                let matches = Enumerable.Cast((() => {
                    let r = new RegExp(`from\\s+("|')(?<Name>.*?)("|')`, `g`);
                    let m = null;
                    let all = new Array<string>();
                    do {
                        m = r.exec(internalTsContent);
                        if (m) {
                            all.push(m);
                        }
                    }
                    while (m);
                    return all;
                })());
                for (
                    let i = 0; i < matches.length; i++) {
                    let m = matches[i];
                    let path = m["groups"][`Name`];
                    path = (<string>(Path.GetFullPath(path, folder)));
                    Enumerable.ToList(exports.filter(_ => (<boolean>(StringComparer.CompareIgnoreCase(_.Path, path))))).forEach(_ => _.Internal = true);
                }
            }
            let $export = this.EnsureExport(folder);
            let rc = (<string>(Path.Combine(folder, `.exportrc.json`)));
            if ((<boolean>(File.Exists(rc)))) {
                let exportRc = JSON.parse((<string>(File.ReadAllText(rc)))) as ExportRc;
                if (!(<boolean>(StringUtil.IsNullOrWhiteSpace(exportRc.from)))) {
                    $export.From = (<string>(Path.Combine((<string>(this.FindRoot(folder))), (<string>(StringUtil.TrimStart((<string>(StringUtil.Replace(exportRc.from, '/'.charCodeAt(0), '\\'.charCodeAt(0)))), '\\'.charCodeAt(0)))))));
                }
            }
            $export.Items.push(...exports);
        } else {
            let $export = this.EnsureExport(folder);
            for (
                let subFolder_index_ = 0, subFolder_source_ = Directory.EnumerateDirectories(folder, `*`); subFolder_index_ < subFolder_source_.length; subFolder_index_++) {
                let subFolder = subFolder_source_[subFolder_index_];
                if (await this.ParseInternalAsync(subFolder)) {
                    $export.Items.push(new ExportItem(subFolder, ExportItemKind.Module));
                }
            }
        }
        return (<boolean>(exports.length > 0));
    }
}
export class ExportItem {
    public Kind: ExportItemKind;
    public Path: string;
    public Internal: boolean = false;
    constructor(path: string | null, kind: ExportItemKind) {
        if (<ExportItemKind>kind == <ExportItemKind>ExportItemKind.File) {
            if (!(<boolean>(File.Exists(path))) && !(<boolean>(File.Exists(path + `.ts`)))) {
                throw new Error();
            }
        } else {
            if (!(<boolean>(Directory.Exists(path)))) {
                throw new Error();
            }
        }
        this.Path = path;
        this.Kind = kind;
    }
}
export class Export {
    public From: string;
    public Folder: string;
    public Items: Array<ExportItem> = [];
    constructor(folder: string | null) {
        this.Folder = folder;
    }
    public ToExports(exports: Array<string> | null, makeRelative: boolean): string | null {
        return (<string>((<string>(Enumerable.Select(exports, _ => `export * from \"${(makeRelative ? (<string>(Export.GetRelativePath(_, this.Folder))) : _)}\";`).join(`\n`)))));
    }
    public static GetRelativePath(filespec: string | null, folder: string | null): string | null {
        let result = path.relative(folder, filespec);
        while (result.indexOf('\\') !== -1) {
            result = result.replace('\\', '/');
        }
        if (!(<boolean>(result.startsWith(`/`))) && !(<boolean>(result.startsWith(`.`)))) {
            result = `/${result}`;
        }
        if (!(<boolean>(result.startsWith(`.`)))) {
            result = `.${result}`;
        }
        return (<string>(result));
    }
    public Build($internal: boolean): string | null {
        let items = Enumerable.ToList(this.Items.filter(_ => _.Internal == $internal || $internal == true));
        let files = Enumerable.ToList(Enumerable.OrderBy(items.filter(_ => <ExportItemKind>_.Kind == <ExportItemKind>ExportItemKind.File), _ => _.Path));
        let modules = Enumerable.ToList(Enumerable.OrderBy(items.filter(_ => <ExportItemKind>_.Kind == <ExportItemKind>ExportItemKind.Module), _ => _.Path));
        let indexTs = new StringBuilder();
        if ((<boolean>(((items).length > 0))) || ($internal == true && (<boolean>(((this.Items).filter(_ => _.Internal == false).length > 0))))) {
            if (modules.length > 0) {
                indexTs.AppendLine(`// Modules`);
                indexTs.AppendLine((<string>(this.ToExports(Enumerable.Select(modules, _ => $internal ? _.Path : (<string>(Path.Combine(_.Path, `public_api`)))), true))));
            }
            if (files.length > 0) {
                indexTs.AppendLine(`// Files`);
                indexTs.AppendLine((<string>(this.ToExports(Enumerable.Select(files, _ => _.Path), true))));
            }
            let contents = (<string>((<string>(indexTs.toString())).trim()));
            return (<string>(`${contents}\n`));
        }
        return (<string>(null));
    }
    public async WriteAsync(): Promise<any> {
        await this.WriteAsyncInternal(`public_api.ts`, (<string>(this.Build(false))));
        await this.WriteAsyncInternal(`index.ts`, (<string>(this.Build(true))));
    }

    public async WriteAsyncInternal(path: string | null, content: string | null): Promise<any> {
        let fullPath = (<string>(Path.Combine(this.Folder, path)));
        if ((<boolean>(StringUtil.IsNullOrWhiteSpace(content)))) {
            return;
        }
        if (!(<boolean>(Directory.Exists(this.Folder)))) {
            Directory.CreateDirectory(this.Folder);
        }
        await File.WriteAllTextAsync(fullPath, content);
        if (path == `public_api.ts` && !(<boolean>(StringUtil.IsNullOrWhiteSpace(this.From))) && !(<boolean>(StringComparer.CompareIgnoreCase(this.From, this.Folder)))) {
            if (!(<boolean>(Directory.Exists(this.From)))) {
                Directory.CreateDirectory(this.From);
            }
            let relativePath = (<string>(StringUtil.Replace((<string>(Path.Combine((<string>(Export.GetRelativePath(this.Folder, this.From))), `public_api`))), '\\'.charCodeAt(0), '/'.charCodeAt(0))));
            let filePath = (<string>(Path.Combine(this.From, `index.ts`)));
            await File.WriteAllTextAsync(filePath, (<string>(this.ToExports((<Array<string>>[relativePath]), false))));
        }
    }
}
export class ExportRc {
    public from: string;
}
export enum ExportItemKind {
    Module,
    File
}
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