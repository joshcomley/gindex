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
            let i = 0; i < this.ExistingIndexFiles.length; i++) {
            const file = this.ExistingIndexFiles[i];
            // Idempotency
            if ((<boolean>(File.Exists(file)))) {
                File.Delete(file);
            }
        }
        for (
            let i = 0; i < this.Exports.length; i++) {
            const $export = this.Exports[i];
            await $export.WriteAsync();
        }
    }
    public async ParseAsync(folder: string | null): Promise<any> {
        await this.ParseInternalAsync(folder);
        for (
            let i = 0; i < this.Exports.length; i++) {
            const $export = this.Exports[i];
            this.CheckExport($export, folder);
        }
    }
    public CheckExport($export: Export | null, folder: string | null): void {
        const CanPatch = (path: string | null): boolean => !(<boolean>(this.IsRoot(path)));
        if (!(<boolean>(CanPatch($export.Folder)))) {
            return;
        }
        if ($export.From != null && !(<boolean>(StringComparer.CompareIgnoreCase($export.From, $export.Folder)))) {
            return;
        }
        if ((<boolean>((($export.Items).length > 0)))) {
            const parent = (<string>(Path.GetDirectoryName($export.Folder)));
            if (parent.length < folder.length) {
                return;
            }
            if (!(<boolean>(CanPatch(parent)))) {
                return;
            }
            if (StringComparer.CompareIgnoreCase(parent, folder)) {
                return;
            }
            const parentExport = this.EnsureExport(parent);
            if (!(<boolean>(((parentExport.Items).filter(_ => (<boolean>(StringComparer.CompareIgnoreCase(_.Path, $export.Folder)))).length > 0)))) {
                parentExport.Items.push(new ExportItem($export.Folder, ExportItemKind.Module));
            }
            this.CheckExport(parentExport, folder);
        }
    }
    public EnsureExport(folder: string | null): Export | null {
        let $export = Enumerable.SingleOrDefault(this.Exports, _ => (<boolean>(StringComparer.CompareIgnoreCase(_.Folder, folder))));
        if ($export == <any>null) {
            $export = new Export(this, folder);
            this.Exports.push($export);
        }
        return $export;
    }
    public FindRoot(folder: string | null): string | null {
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
        const exports = new Array<ExportItem>();
        if (!(<boolean>(this.IsRoot(folder)))) {
            const MakeFullPath = (p: string | null): string => (<string>((<string>(Path.Combine(folder, p)))))
            for (
                let i = 0, files = Directory.EnumerateFiles(folder, `*.ts`); i < files.length; i++) {
                const file = files[i];
                if ((<boolean>(this.HasName(file, `index`))) || (<boolean>(this.HasName(file, `public_api`)))) {
                    this.ExistingIndexFiles.push(file);
                    continue;
                }
                if ((<boolean>((<string>(file.toLowerCase())).endsWith(`.spec.ts`)))) {
                    continue;
                }
                const matches = (<boolean>(new RegExp(`export\\s+(declare\\s+){0,1}(abstract\\s+){0,1}(const|type|enum|class|interface|function)\\s+(?<Name>[A-z0-9_]*?)\\s*({|<|\\b|$| |\\()`, `g`).test(await File.ReadAllTextAsync(file))));
                if (matches) {
                    exports.push(new ExportItem((<string>(MakeFullPath((<string>(Path.GetFileName((<string>(Path.GetFileNameWithoutExtension(file))))))))), ExportItemKind.File));
                }
            }
            for (
                let i = 0, subFolders = Directory.EnumerateDirectories(folder, `*`); i < subFolders.length; i++) {
                const subFolder = subFolders[i];
                await this.ParseInternalAsync(subFolder);
            }
            const internalTs = (<string>(Path.Combine(folder, `internal.ts`)));
            if ((<boolean>(File.Exists(internalTs)))) {
                const internalTsContent = await File.ReadAllTextAsync(internalTs);
                const matches = Enumerable.Cast((() => {
                    const r = new RegExp(`from\\s+("|')(?<Name>.*?)("|')`, `g`);
                    let m = null;
                    const all = new Array<string>();
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
                    const m = matches[i];
                    let path = m["groups"][`Name`];
                    path = (<string>(Path.GetFullPath(path, folder)));
                    Enumerable.ToList(exports.filter(_ => (<boolean>(StringComparer.CompareIgnoreCase(_.Path, path))))).forEach(_ => _.Internal = true);
                }
            }
            const $export = this.EnsureExport(folder);
            const rc = (<string>(Path.Combine(folder, `.exportrc.json`)));
            if ((<boolean>(File.Exists(rc)))) {
                const exportRc = JSON.parse((<string>(File.ReadAllText(rc)))) as ExportRc;
                $export.Rc = exportRc;
            }
            $export.Items.push(...exports);
        } else {
            const $export = this.EnsureExport(folder);
            for (
                let i = 0, subFolders = Directory.EnumerateDirectories(folder, `*`); i < subFolders.length; i++) {
                const subFolder = subFolders[i];
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
    public get From(): string {
        if (!(<boolean>(StringUtil.IsNullOrWhiteSpace(this.Rc?.from)))) {
            return (<string>(Path.Combine((<string>(this.exporter.FindRoot(this.Folder))), (<string>(StringUtil.TrimStart((<string>(StringUtil.Replace(this.Rc.from, '/'.charCodeAt(0), '\\'.charCodeAt(0)))), '\\'.charCodeAt(0)))))));
        }
        return null;
    }
    public Rc: ExportRc;
    public Folder: string;
    public Items: Array<ExportItem> = [];

    constructor(private exporter: Exporter, folder: string | null) {
        this.Folder = folder;
    }

    public ToExports(exports: Array<string> | null, makeRelative: boolean): string | null {
        const filtered = exports.slice()
            .filter(_ => !this.IsExcluded(_));
        return (<string>((<string>(Enumerable.Select(filtered, _ => `export * from \"${(makeRelative ? (<string>(Export.GetRelativePath(_, this.Folder))) : _)}\";`).join(`\n`)))));
    }

    private IsExcluded(name: string) {
        name = path.basename(name);
        return this.Rc?.exclude?.filter(_ => _.toLowerCase() === name.toLowerCase()).length > 0;
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
        const items = Enumerable.ToList(this.Items.filter(_ => _.Internal == $internal || $internal == true));
        const files = Enumerable.ToList(Enumerable.OrderBy(items.filter(_ => <ExportItemKind>_.Kind == <ExportItemKind>ExportItemKind.File), _ => _.Path));
        const modules = Enumerable.ToList(Enumerable.OrderBy(items.filter(_ => <ExportItemKind>_.Kind == <ExportItemKind>ExportItemKind.Module), _ => _.Path));
        const indexTs = new StringBuilder();
        if ((<boolean>(((items).length > 0))) || ($internal == true && (<boolean>(((this.Items).filter(_ => _.Internal == false).length > 0))))) {
            if (modules.length > 0) {
                indexTs.AppendLine(`// Modules`);
                indexTs.AppendLine((<string>(this.ToExports(Enumerable.Select(modules, _ => $internal ? _.Path : (<string>(Path.Combine(_.Path, `public_api`)))), true))));
            }
            if (files.length > 0) {
                indexTs.AppendLine(`// Files`);
                indexTs.AppendLine((<string>(this.ToExports(Enumerable.Select(files, _ => _.Path), true))));
            }
            const contents = (<string>((<string>(indexTs.toString())).trim()));
            return this.FinaliseFileContents(contents);
        }
        return null;
    }

    public async WriteAsync(): Promise<any> {
        await this.WriteAsyncInternal(`public_api.ts`, (<string>(this.Build(false))));
        await this.WriteAsyncInternal(`index.ts`, (<string>(this.Build(true))));
    }

    public async WriteAsyncInternal(path: string | null, content: string | null): Promise<any> {
        const fullPath = (<string>(Path.Combine(this.Folder, path)));
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
            const relativePath = (<string>(StringUtil.Replace((<string>(Path.Combine((<string>(Export.GetRelativePath(this.Folder, this.From))), `public_api`))), '\\'.charCodeAt(0), '/'.charCodeAt(0))));
            const filePath = (<string>(Path.Combine(this.From, `index.ts`)));
            const contents = this.ToExports((<Array<string>>[relativePath]), false);
            await File.WriteAllTextAsync(filePath, this.FinaliseFileContents(contents));
        }
    }

    private FinaliseFileContents(contents: string) {
        return `${contents}\n`;
    }
}
export class ExportRc {
    public from: string;
    public exclude: string[];
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