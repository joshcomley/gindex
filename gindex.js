"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ExportItemKind = exports.ExportRc = exports.Export = exports.ExportItem = exports.Exporter = void 0;
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/member-ordering */
var tsutility_1 = require("@brandless/tsutility");
var process_1 = require("process");
var fs = require('fs');
var path = require('path');
var Path = /** @class */ (function () {
    function Path() {
    }
    Path.GetDirectoryName = function (name) {
        return path.dirname(name);
    };
    Path.GetFileName = function (name) {
        return path.basename(name);
    };
    Path.GetFileNameWithoutExtension = function (name) {
        return path.parse(name).name;
    };
    Path.GetFullPath = function (dir, basePath) {
        return path.resolve(basePath, dir);
    };
    Path.Combine = function () {
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        return path.join.apply(path, names);
    };
    Path.DirectorySeparatorChar = '\\';
    return Path;
}());
var Directory = /** @class */ (function () {
    function Directory() {
    }
    Directory.CreateDirectory = function (name) {
        if (!fs.existsSync(name)) {
            fs.mkdirSync(name, { recursive: true });
        }
    };
    Directory.EnumerateDirectories = function (source, filter) {
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(function (dirent) { return dirent.isDirectory(); })
            .map(function (dirent) { return path.join(source, dirent.name); });
    };
    Directory.EnumerateFiles = function (source, filter) {
        if (filter != null) {
            while (filter.startsWith("*")) {
                filter = filter.substr(1);
            }
        }
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(function (dirent) { return dirent.isFile(); })
            .filter(function (dirent) { return filter == null || dirent.name.toLowerCase().endsWith(filter.toLowerCase()); })
            .map(function (dirent) { return path.join(source, dirent.name); });
    };
    Directory.Exists = function (name) {
        return fs.existsSync(name);
    };
    return Directory;
}());
var File = /** @class */ (function () {
    function File() {
    }
    File.WriteAllTextAsync = function (name, contents) {
        return new Promise(function (resolver) {
            fs.writeFile(name, contents, function (err) { return resolver(null); });
        });
    };
    File.Exists = function (name) {
        return fs.existsSync(name);
    };
    File.Delete = function (name) {
        return fs.unlinkSync(name);
    };
    File.ReadAllText = function (name) {
        return fs.readFileSync(name, "utf-8");
    };
    File.ReadAllTextAsync = function (name) {
        return new Promise(function (resolver) {
            fs.readFile(name, "utf-8", function (err, data) { return resolver(data); });
        });
    };
    return File;
}());
var StringComparer = /** @class */ (function () {
    function StringComparer() {
    }
    StringComparer.CompareIgnoreCase = function (left, right) {
        return left.toLowerCase() === right.toLowerCase();
    };
    return StringComparer;
}());
var Exporter = /** @class */ (function () {
    function Exporter() {
        this.Exports = [];
        this.ExistingIndexFiles = [];
        this.RootFile = "ng-package.json";
    }
    Exporter.prototype.WriteAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var file_index_, file_source_, file, export_index_, export_source_, $export;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        for (file_index_ = 0, file_source_ = this.ExistingIndexFiles; file_index_ < file_source_.length; file_index_++) {
                            file = file_source_[file_index_];
                            // Idempotency
                            if ((File.Exists(file))) {
                                File.Delete(file);
                            }
                        }
                        export_index_ = 0, export_source_ = this.Exports;
                        _a.label = 1;
                    case 1:
                        if (!(export_index_ < export_source_.length)) return [3 /*break*/, 4];
                        $export = export_source_[export_index_];
                        return [4 /*yield*/, $export.WriteAsync()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        export_index_++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Exporter.prototype.ParseAsync = function (folder) {
        return __awaiter(this, void 0, void 0, function () {
            var export_index_, export_source_, $export;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ParseInternalAsync(folder)];
                    case 1:
                        _a.sent();
                        for (export_index_ = 0, export_source_ = tsutility_1.Enumerable.ToList(this.Exports); export_index_ < export_source_.length; export_index_++) {
                            $export = export_source_[export_index_];
                            this.CheckExport($export, folder);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Exporter.prototype.CheckExport = function ($export, folder) {
        var _this = this;
        var CanPatch = function (path) { return !(_this.IsRoot(path)); };
        if (!(CanPatch($export.Folder))) {
            return;
        }
        if ($export.From != null && !(StringComparer.CompareIgnoreCase($export.From, $export.Folder))) {
            return;
        }
        if (((($export.Items).length > 0))) {
            var parent_1 = (Path.GetDirectoryName($export.Folder));
            if (parent_1.length < folder.length) {
                return;
            }
            if (!(CanPatch(parent_1))) {
                return;
            }
            if (StringComparer.CompareIgnoreCase(parent_1, folder)) {
                return;
            }
            var parentExport = this.EnsureExport(parent_1);
            if (!(((parentExport.Items).filter(function (_) { return (StringComparer.CompareIgnoreCase(_.Path, $export.Folder)); }).length > 0))) {
                parentExport.Items.push(new ExportItem($export.Folder, ExportItemKind.Module));
            }
            this.CheckExport(parentExport, folder);
        }
    };
    Exporter.prototype.EnsureExport = function (folder) {
        var $export = tsutility_1.Enumerable.SingleOrDefault(this.Exports, function (_) { return (StringComparer.CompareIgnoreCase(_.Folder, folder)); });
        if ($export == null) {
            $export = new Export(folder);
            this.Exports.push($export);
        }
        return $export;
    };
    Exporter.prototype.FindRoot = function (folder) {
        var root = folder;
        while (!(this.IsRoot(root))) {
            root = (Path.GetDirectoryName(root));
        }
        return (root);
    };
    Exporter.prototype.IsRoot = function (folder) {
        return (File.Exists((Path.Combine(folder, this.RootFile))));
    };
    Exporter.prototype.HasName = function (file, name) {
        return StringComparer.CompareIgnoreCase(Path.GetFileNameWithoutExtension(file), name);
    };
    Exporter.prototype.ParseInternalAsync = function (folder) {
        return __awaiter(this, void 0, void 0, function () {
            var exports, MakeFullPath, i, files, file, matches, _a, _b, i, subFolders, subFolder, internalTs, internalTsContent_1, matches, _loop_1, i, $export, rc, exportRc, $export, subFolder_index_, subFolder_source_, subFolder;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (((Path.GetFileName(folder)).toLowerCase()) == "coverage") {
                            return [2 /*return*/, (false)];
                        }
                        exports = new Array();
                        if (!!(this.IsRoot(folder))) return [3 /*break*/, 11];
                        MakeFullPath = function (p) { return (Path.Combine(folder, p)); };
                        i = 0, files = Directory.EnumerateFiles(folder, "*.ts");
                        _d.label = 1;
                    case 1:
                        if (!(i < files.length)) return [3 /*break*/, 4];
                        file = files[i];
                        if ((this.HasName(file, "index")) || (this.HasName(file, "public_api"))) {
                            this.ExistingIndexFiles.push(file);
                            return [3 /*break*/, 3];
                        }
                        if (((file.toLowerCase()).endsWith(".spec.ts"))) {
                            return [3 /*break*/, 3];
                        }
                        _b = (_a = new RegExp("export\\s+(declare\\s+){0,1}(abstract\\s+){0,1}(const|type|enum|class|interface|function)\\s+(?<Name>[A-z0-9_]*?)\\s*({|<|\\b|$| |\\()", "g")).test;
                        return [4 /*yield*/, File.ReadAllTextAsync(file)];
                    case 2:
                        matches = (_b.apply(_a, [_d.sent()]));
                        if (matches) {
                            exports.push(new ExportItem((MakeFullPath((Path.GetFileName((Path.GetFileNameWithoutExtension(file)))))), ExportItemKind.File));
                        }
                        _d.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        i = 0, subFolders = Directory.EnumerateDirectories(folder, "*");
                        _d.label = 5;
                    case 5:
                        if (!(i < subFolders.length)) return [3 /*break*/, 8];
                        subFolder = subFolders[i];
                        return [4 /*yield*/, this.ParseInternalAsync(subFolder)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        internalTs = (Path.Combine(folder, "internal.ts"));
                        if (!(File.Exists(internalTs))) return [3 /*break*/, 10];
                        return [4 /*yield*/, File.ReadAllTextAsync(internalTs)];
                    case 9:
                        internalTsContent_1 = _d.sent();
                        matches = tsutility_1.Enumerable.Cast((function () {
                            var r = new RegExp("from\\s+(\"|')(?<Name>.*?)(\"|')", "g");
                            var m = null;
                            var all = new Array();
                            do {
                                m = r.exec(internalTsContent_1);
                                if (m) {
                                    all.push(m);
                                }
                            } while (m);
                            return all;
                        })());
                        _loop_1 = function (i) {
                            var m = matches[i];
                            var path_1 = m["groups"]["Name"];
                            path_1 = (Path.GetFullPath(path_1, folder));
                            tsutility_1.Enumerable.ToList(exports.filter(function (_) { return (StringComparer.CompareIgnoreCase(_.Path, path_1)); })).forEach(function (_) { return _.Internal = true; });
                        };
                        for (i = 0; i < matches.length; i++) {
                            _loop_1(i);
                        }
                        _d.label = 10;
                    case 10:
                        $export = this.EnsureExport(folder);
                        rc = (Path.Combine(folder, ".exportrc.json"));
                        if ((File.Exists(rc))) {
                            exportRc = JSON.parse((File.ReadAllText(rc)));
                            if (!(tsutility_1.StringUtil.IsNullOrWhiteSpace(exportRc.from))) {
                                $export.From = (Path.Combine((this.FindRoot(folder)), (tsutility_1.StringUtil.TrimStart((tsutility_1.StringUtil.Replace(exportRc.from, '/'.charCodeAt(0), '\\'.charCodeAt(0))), '\\'.charCodeAt(0)))));
                            }
                        }
                        (_c = $export.Items).push.apply(_c, exports);
                        return [3 /*break*/, 15];
                    case 11:
                        $export = this.EnsureExport(folder);
                        subFolder_index_ = 0, subFolder_source_ = Directory.EnumerateDirectories(folder, "*");
                        _d.label = 12;
                    case 12:
                        if (!(subFolder_index_ < subFolder_source_.length)) return [3 /*break*/, 15];
                        subFolder = subFolder_source_[subFolder_index_];
                        return [4 /*yield*/, this.ParseInternalAsync(subFolder)];
                    case 13:
                        if (_d.sent()) {
                            $export.Items.push(new ExportItem(subFolder, ExportItemKind.Module));
                        }
                        _d.label = 14;
                    case 14:
                        subFolder_index_++;
                        return [3 /*break*/, 12];
                    case 15: return [2 /*return*/, (exports.length > 0)];
                }
            });
        });
    };
    return Exporter;
}());
exports.Exporter = Exporter;
var ExportItem = /** @class */ (function () {
    function ExportItem(path, kind) {
        this.Internal = false;
        if (kind == ExportItemKind.File) {
            if (!(File.Exists(path)) && !(File.Exists(path + ".ts"))) {
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
    return ExportItem;
}());
exports.ExportItem = ExportItem;
var Export = /** @class */ (function () {
    function Export(folder) {
        this.Items = [];
        this.Folder = folder;
    }
    Export.prototype.ToExports = function (exports, makeRelative) {
        var _this = this;
        return (tsutility_1.Enumerable.Select(exports, function (_) { return "export * from \"" + (makeRelative ? (Export.GetRelativePath(_, _this.Folder)) : _) + "\";"; }).join("\n"));
    };
    Export.GetRelativePath = function (filespec, folder) {
        var result = path.relative(folder, filespec);
        while (result.indexOf('\\') !== -1) {
            result = result.replace('\\', '/');
        }
        if (!(result.startsWith("/")) && !(result.startsWith("."))) {
            result = "/" + result;
        }
        if (!(result.startsWith("."))) {
            result = "." + result;
        }
        return (result);
    };
    Export.prototype.Build = function ($internal) {
        var items = tsutility_1.Enumerable.ToList(this.Items.filter(function (_) { return _.Internal == $internal || $internal == true; }));
        var files = tsutility_1.Enumerable.ToList(tsutility_1.Enumerable.OrderBy(items.filter(function (_) { return _.Kind == ExportItemKind.File; }), function (_) { return _.Path; }));
        var modules = tsutility_1.Enumerable.ToList(tsutility_1.Enumerable.OrderBy(items.filter(function (_) { return _.Kind == ExportItemKind.Module; }), function (_) { return _.Path; }));
        var indexTs = new tsutility_1.StringBuilder();
        if ((((items).length > 0)) || ($internal == true && (((this.Items).filter(function (_) { return _.Internal == false; }).length > 0)))) {
            if (modules.length > 0) {
                indexTs.AppendLine("// Modules");
                indexTs.AppendLine((this.ToExports(tsutility_1.Enumerable.Select(modules, function (_) { return $internal ? _.Path : (Path.Combine(_.Path, "public_api")); }), true)));
            }
            if (files.length > 0) {
                indexTs.AppendLine("// Files");
                indexTs.AppendLine((this.ToExports(tsutility_1.Enumerable.Select(files, function (_) { return _.Path; }), true)));
            }
            var contents = ((indexTs.toString()).trim());
            return (contents);
        }
        return (null);
    };
    Export.prototype.WriteAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.WriteAsyncInternal("public_api.ts", (this.Build(false)))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.WriteAsyncInternal("index.ts", (this.Build(true)))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Export.prototype.WriteAsyncInternal = function (path, content) {
        return __awaiter(this, void 0, void 0, function () {
            var fullPath, relativePath, filePath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fullPath = (Path.Combine(this.Folder, path));
                        if ((tsutility_1.StringUtil.IsNullOrWhiteSpace(content))) {
                            return [2 /*return*/];
                        }
                        if (!(Directory.Exists(this.Folder))) {
                            Directory.CreateDirectory(this.Folder);
                        }
                        return [4 /*yield*/, File.WriteAllTextAsync(fullPath, content)];
                    case 1:
                        _a.sent();
                        if (!(path == "public_api.ts" && !(tsutility_1.StringUtil.IsNullOrWhiteSpace(this.From)) && !(StringComparer.CompareIgnoreCase(this.From, this.Folder)))) return [3 /*break*/, 3];
                        if (!(Directory.Exists(this.From))) {
                            Directory.CreateDirectory(this.From);
                        }
                        relativePath = (tsutility_1.StringUtil.Replace((Path.Combine((Export.GetRelativePath(this.Folder, this.From)), "public_api")), '\\'.charCodeAt(0), '/'.charCodeAt(0)));
                        filePath = (Path.Combine(this.From, "index.ts"));
                        return [4 /*yield*/, File.WriteAllTextAsync(filePath, (this.ToExports([relativePath], false)))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return Export;
}());
exports.Export = Export;
var ExportRc = /** @class */ (function () {
    function ExportRc() {
    }
    return ExportRc;
}());
exports.ExportRc = ExportRc;
var ExportItemKind;
(function (ExportItemKind) {
    ExportItemKind[ExportItemKind["Module"] = 0] = "Module";
    ExportItemKind[ExportItemKind["File"] = 1] = "File";
})(ExportItemKind = exports.ExportItemKind || (exports.ExportItemKind = {}));
var args = process.argv.slice(2);
var dir = args.length > 0 ? args[0] : process_1.cwd();
// dir = `D:\\Code\\awsm\\Titan\\feature\\Frontend\\src\\projects\\packages`;
var exporter = new Exporter();
exporter.ParseAsync(dir).then(function () {
    // for (const ex of exporter.Exports) {
    //     console.log("Folder: " + ex.Folder);
    //     for (const c of ex.Items) {
    //         console.log("Export: " + c.Path + " - " + c.Kind);
    //     }
    // }
    // exporter.WriteAsync().then(() => {
    //     console.log("Done");
    // });
});
