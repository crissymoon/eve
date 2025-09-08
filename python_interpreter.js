class PythonInterpreter {
    constructor() {
        this.globals = {};
        this.builtins = {};
        this.stdlibPath = 'python_stdlib/';
        this.modules = new Map();
        this.executionLog = [];
        this.functions = new Map();
        this.classes = new Map();
        this.importedModules = new Map();
        this.scopeStack = [{}];
        this.printOutput = [];
        this.fileSystem = new Map();
        this.currentDir = '/workspace';
        this.openFiles = new Map();
        this.initializeBuiltins();
        this.initializeStandardTypes();
        this.initializeFileSystem();
    }

    writeToRealFileSystem(filename, content, append = false) {
        console.log('Writing to file:', filename, 'Content:', content);
        return fetch('write_data.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({filename, content, append})
        }).then(response => response.json())
        .then(data => {
            console.log('PHP write result:', data);
            return data;
        })
        .catch(error => {
            console.log('PHP write error:', error);
            throw error;
        });
    }

    initializeBuiltins() {
        this.builtins.range = function(start, stop, step = 1) {
            if (stop === undefined) {
                stop = start;
                start = 0;
            }
            const result = [];
            if (step > 0) {
                for (let i = start; i < stop; i += step) {
                    result.push(i);
                }
            } else if (step < 0) {
                for (let i = start; i > stop; i += step) {
                    result.push(i);
                }
            }
            return result;
        };

        this.builtins.print = (...args) => {
            const output = args.map(arg => this.toString(arg)).join(' ');
            this.printOutput.push(output);
            return output;
        };

        this.builtins.len = (obj) => {
            if (Array.isArray(obj) || typeof obj === 'string') {
                return obj.length;
            }
            if (obj && typeof obj === 'object' && obj.__len__) {
                return obj.__len__();
            }
            return 0;
        };

        this.builtins.str = (obj) => this.toString(obj);
        this.builtins.int = (obj) => {
            if (typeof obj === 'string') {
                const parsed = parseInt(obj);
                if (isNaN(parsed)) throw new Error(`invalid literal for int() with base 10: '${obj}'`);
                return parsed;
            }
            return Math.floor(Number(obj));
        };
        this.builtins.float = (obj) => {
            if (typeof obj === 'string') {
                const parsed = parseFloat(obj);
                if (isNaN(parsed)) throw new Error(`could not convert string to float: '${obj}'`);
                return parsed;
            }
            return Number(obj);
        };
        this.builtins.bool = (obj) => Boolean(obj);
        this.builtins.list = (iterable) => {
            if (Array.isArray(iterable)) return [...iterable];
            if (typeof iterable === 'string') return [...iterable];
            if (iterable && iterable[Symbol.iterator]) return [...iterable];
            return [];
        };
        this.builtins.tuple = (iterable) => {
            const arr = this.builtins.list(iterable);
            arr.__class__ = 'tuple';
            return arr;
        };
        this.builtins.dict = (iterable) => {
            if (iterable) {
                const result = {};
                for (const [key, value] of iterable) {
                    result[key] = value;
                }
                return result;
            }
            return {};
        };
        this.builtins.set = (iterable) => {
            return new Set(iterable || []);
        };
        this.builtins.abs = Math.abs;
        this.builtins.max = (...args) => {
            if (args.length === 1 && Array.isArray(args[0])) {
                return Math.max(...args[0]);
            }
            return Math.max(...args);
        };
        this.builtins.min = (...args) => {
            if (args.length === 1 && Array.isArray(args[0])) {
                return Math.min(...args[0]);
            }
            return Math.min(...args);
        };
        this.builtins.sum = (iterable, start = 0) => {
            return iterable.reduce((acc, val) => acc + val, start);
        };
        this.builtins.sorted = (iterable, reverse = false) => {
            const arr = [...iterable];
            return reverse ? arr.sort().reverse() : arr.sort();
        };
        this.builtins.reversed = (iterable) => {
            return [...iterable].reverse();
        };
        this.builtins.enumerate = function*(iterable, start = 0) {
            let index = start;
            for (const item of iterable) {
                yield [index++, item];
            }
        };
        this.builtins.zip = function*(...iterables) {
            const iterators = iterables.map(iter => iter[Symbol.iterator]());
            while (true) {
                const results = iterators.map(iter => iter.next());
                if (results.some(result => result.done)) break;
                yield results.map(result => result.value);
            }
        };
        
        this.builtins.open = (filename, mode = 'r', encoding = 'utf-8') => {
            return this.createFileObject(filename, mode, encoding);
        };
        
        this.builtins.type = (obj) => {
            if (obj === null || obj === undefined) return 'NoneType';
            if (typeof obj === 'boolean') return 'bool';
            if (typeof obj === 'number') return Number.isInteger(obj) ? 'int' : 'float';
            if (typeof obj === 'string') return 'str';
            if (Array.isArray(obj)) return obj.__class__ || 'list';
            if (typeof obj === 'object') return 'dict';
            if (typeof obj === 'function') return 'function';
            return 'object';
        };
        this.builtins.map = function*(func, iterable) {
            for (const item of iterable) {
                yield func(item);
            }
        };
        this.builtins.filter = function*(func, iterable) {
            for (const item of iterable) {
                if (func(item)) yield item;
            }
        };
        this.builtins.any = (iterable) => {
            for (const item of iterable) {
                if (item) return true;
            }
            return false;
        };
        this.builtins.all = (iterable) => {
            for (const item of iterable) {
                if (!item) return false;
            }
            return true;
        };
        this.builtins.round = (number, ndigits = 0) => {
            const factor = Math.pow(10, ndigits);
            return Math.round(number * factor) / factor;
        };
        this.builtins.pow = Math.pow;
        this.builtins.isinstance = (obj, classinfo) => {
            if (Array.isArray(classinfo)) {
                return classinfo.some(cls => this.builtins.isinstance(obj, cls));
            }
            if (typeof classinfo === 'string') {
                return typeof obj === classinfo || (obj && obj.__class__ === classinfo);
            }
            return obj instanceof classinfo;
        };
        this.builtins.hasattr = (obj, name) => {
            return obj && (name in obj);
        };
        this.builtins.getattr = (obj, name, defaultValue) => {
            if (obj && name in obj) return obj[name];
            if (defaultValue !== undefined) return defaultValue;
            throw new Error(`'${typeof obj}' object has no attribute '${name}'`);
        };
        this.builtins.setattr = (obj, name, value) => {
            if (obj) obj[name] = value;
        };
        this.builtins.delattr = (obj, name) => {
            if (obj && name in obj) delete obj[name];
        };
        this.builtins.dir = (obj) => {
            if (!obj) return Object.keys(this.getCurrentScope());
            return Object.keys(obj);
        };
        this.builtins.type = (obj) => {
            if (obj === null) return 'NoneType';
            if (Array.isArray(obj)) return obj.__class__ || 'list';
            return typeof obj;
        };
    }

    initializeStandardTypes() {
        this.builtins.ValueError = class ValueError extends Error {
            constructor(message) {
                super(message);
                this.name = 'ValueError';
            }
        };
        this.builtins.TypeError = class TypeError extends Error {
            constructor(message) {
                super(message);
                this.name = 'TypeError';
            }
        };
        this.builtins.IndexError = class IndexError extends Error {
            constructor(message) {
                super(message);
                this.name = 'IndexError';
            }
        };
        this.builtins.KeyError = class KeyError extends Error {
            constructor(message) {
                super(message);
                this.name = 'KeyError';
            }
        };
        this.builtins.AttributeError = class AttributeError extends Error {
            constructor(message) {
                super(message);
                this.name = 'AttributeError';
            }
        };
    }

    initializeFileSystem() {
        // Initialize with some basic directories
        this.fileSystem.set('/workspace', {
            type: 'directory',
            name: 'workspace',
            created: new Date()
        });
        this.fileSystem.set('/tmp', {
            type: 'directory',
            name: 'tmp',
            created: new Date()
        });
        this.fileSystem.set('/home', {
            type: 'directory',
            name: 'home',
            created: new Date()
        });
        this.fileSystem.set('/home/user', {
            type: 'directory',
            name: 'user',
            created: new Date()
        });
    }

    createFileObject(filename, mode = 'r', encoding = 'utf-8') {
        const fileId = `${filename}_${mode}_${Date.now()}`;
        
        const fileObj = {
            __class__: 'file',
            name: filename,
            mode: mode,
            encoding: encoding,
            closed: false,
            readable: mode.includes('r') || mode.includes('+'),
            writable: mode.includes('w') || mode.includes('a') || mode.includes('+'),
            _content: '',
            _position: 0,
            
            read: (size = -1) => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                if (!fileObj.readable) {
                    throw new Error('File not open for reading');
                }
                
                const entry = this.fileSystem.get(filename);
                if (entry && entry.type === 'file') {
                    fileObj._content = entry.content || '';
                }
                
                if (size === -1) {
                    const result = fileObj._content.substring(fileObj._position);
                    fileObj._position = fileObj._content.length;
                    return result;
                } else {
                    const result = fileObj._content.substring(fileObj._position, fileObj._position + size);
                    fileObj._position += result.length;
                    return result;
                }
            },
            
            readline: () => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                if (!fileObj.readable) {
                    throw new Error('File not open for reading');
                }
                
                const entry = this.fileSystem.get(filename);
                if (entry && entry.type === 'file') {
                    fileObj._content = entry.content || '';
                }
                
                const startPos = fileObj._position;
                const newlineIndex = fileObj._content.indexOf('\n', startPos);
                
                if (newlineIndex === -1) {
                    const result = fileObj._content.substring(startPos);
                    fileObj._position = fileObj._content.length;
                    return result;
                } else {
                    const result = fileObj._content.substring(startPos, newlineIndex + 1);
                    fileObj._position = newlineIndex + 1;
                    return result;
                }
            },
            
            readlines: () => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                if (!fileObj.readable) {
                    throw new Error('File not open for reading');
                }
                
                const entry = this.fileSystem.get(filename);
                if (entry && entry.type === 'file') {
                    fileObj._content = entry.content || '';
                }
                
                const lines = fileObj._content.split('\n');
                if (lines[lines.length - 1] === '') lines.pop();
                return lines.map(line => line + '\n');
            },
            
            write: (data) => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                if (!fileObj.writable) {
                    throw new Error('File not open for writing');
                }
                
                const strData = String(data);
                
                if (mode.includes('a')) {
                    // Append mode
                    const entry = this.fileSystem.get(filename);
                    if (entry && entry.type === 'file') {
                        fileObj._content = (entry.content || '') + strData;
                    } else {
                        fileObj._content = strData;
                    }
                } else {
                    // Write mode
                    if (fileObj._position === 0 && mode.includes('w')) {
                        fileObj._content = strData;
                    } else {
                        const before = fileObj._content.substring(0, fileObj._position);
                        const after = fileObj._content.substring(fileObj._position + strData.length);
                        fileObj._content = before + strData + after;
                    }
                }
                
                fileObj._position += strData.length;
                
                // Update file system
                this.fileSystem.set(filename, {
                    type: 'file',
                    name: filename.split('/').pop(),
                    content: fileObj._content,
                    modified: new Date()
                });
                
                // Write to real file system
                this.writeToRealFileSystem(filename, fileObj._content, mode.includes('a'));
                
                return strData.length;
            },
            
            writelines: (lines) => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                if (!fileObj.writable) {
                    throw new Error('File not open for writing');
                }
                
                const content = lines.join('');
                return fileObj.write(content);
            },
            
            seek: (offset, whence = 0) => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                
                const entry = this.fileSystem.get(filename);
                if (entry && entry.type === 'file') {
                    fileObj._content = entry.content || '';
                }
                
                if (whence === 0) {
                    fileObj._position = offset;
                } else if (whence === 1) {
                    fileObj._position += offset;
                } else if (whence === 2) {
                    fileObj._position = fileObj._content.length + offset;
                }
                
                fileObj._position = Math.max(0, Math.min(fileObj._position, fileObj._content.length));
                return fileObj._position;
            },
            
            tell: () => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                return fileObj._position;
            },
            
            flush: () => {
                if (fileObj.closed) {
                    throw new Error('I/O operation on closed file');
                }
                // In memory implementation, nothing to flush
            },
            
            close: () => {
                fileObj.closed = true;
                this.openFiles.delete(fileId);
            },
            
            __enter__: () => fileObj,
            
            __exit__: (exc_type, exc_val, exc_tb) => {
                fileObj.close();
                return false;
            }
        };
        
        // Initialize file content if it exists
        const entry = this.fileSystem.get(filename);
        if (entry && entry.type === 'file') {
            fileObj._content = entry.content || '';
        } else if (mode.includes('r') && !mode.includes('+') && !mode.includes('w') && !mode.includes('a')) {
            throw new Error(`FileNotFoundError: [Errno 2] No such file or directory: '${filename}'`);
        }
        
        this.openFiles.set(fileId, fileObj);
        return fileObj;
    }

    toString(obj) {
        if (obj === null || obj === undefined) return 'None';
        if (typeof obj === 'string') return obj;
        if (typeof obj === 'boolean') return obj ? 'True' : 'False';
        if (Array.isArray(obj)) {
            if (obj.__class__ === 'tuple') {
                return `(${obj.map(item => this.toString(item)).join(', ')})`;
            }
            return `[${obj.map(item => this.toString(item)).join(', ')}]`;
        }
        if (obj instanceof Set) {
            return `{${[...obj].map(item => this.toString(item)).join(', ')}}`;
        }
        if (typeof obj === 'object') {
            const pairs = Object.entries(obj).map(([k, v]) => `'${k}': ${this.toString(v)}`);
            return `{${pairs.join(', ')}}`;
        }
        return String(obj);
    }

    getCurrentScope() {
        return this.scopeStack[this.scopeStack.length - 1];
    }

    pushScope(scope = {}) {
        this.scopeStack.push(scope);
    }

    popScope() {
        if (this.scopeStack.length > 1) {
            return this.scopeStack.pop();
        }
        return this.scopeStack[0];
    }

    getVariable(name) {
        for (let i = this.scopeStack.length - 1; i >= 0; i--) {
            if (name in this.scopeStack[i]) {
                return this.scopeStack[i][name];
            }
        }
        if (name in this.globals) {
            return this.globals[name];
        }
        if (name in this.builtins) {
            return this.builtins[name];
        }
        throw new Error(`name '${name}' is not defined`);
    }

    setVariable(name, value) {
        this.getCurrentScope()[name] = value;
    }

    async loadModule(moduleName) {
        if (this.importedModules.has(moduleName)) {
            return this.importedModules.get(moduleName);
        }

        if (this.modules.has(moduleName)) {
            return this.modules.get(moduleName);
        }

        // Handle built-in modules
        const builtinModules = {
            'sys': this.createSysModule(),
            'math': this.createMathModule(),
            'time': this.createTimeModule(),
            'json': this.createJsonModule(),
            'collections': this.createCollectionsModule(),
            'random': this.createRandomModule(),
            'os': this.createOsModule(),
            'io': this.createIoModule()
        };

        if (builtinModules[moduleName]) {
            const module = builtinModules[moduleName];
            this.modules.set(moduleName, module);
            this.importedModules.set(moduleName, module);
            return module;
        }

        try {
            let modulePath = `${this.stdlibPath}${moduleName}.py`;
            let response = await fetch(modulePath);
            
            if (!response.ok) {
                modulePath = `py_files/${moduleName}.py`;
                response = await fetch(modulePath);
            }
            
            if (!response.ok) {
                throw new Error(`No module named '${moduleName}'`);
            }
            
            const moduleCode = await response.text();
            const moduleObj = await this.createModuleObject(moduleName, moduleCode);
            this.modules.set(moduleName, moduleObj);
            this.importedModules.set(moduleName, moduleObj);
            return moduleObj;
        } catch (error) {
            this.logExecution(`Failed to load module ${moduleName}: ${error.message}`);
            throw new Error(`No module named '${moduleName}'`);
        }
    }

    createSysModule() {
        return {
            __name__: 'sys',
            version: '3.11.0 (emscripten)',
            platform: 'emscripten',
            path: ['', 'python_stdlib'],
            modules: this.modules,
            builtin_module_names: ['builtins', 'sys', 'math', 'time', 'json', 'collections', 'random', 'os'],
            exit: (code = 0) => { throw new Error(`SystemExit: ${code}`); },
            getrefcount: (obj) => 1,
            getsizeof: (obj) => JSON.stringify(obj).length
        };
    }

    createMathModule() {
        return {
            __name__: 'math',
            pi: Math.PI,
            e: Math.E,
            tau: 2 * Math.PI,
            inf: Infinity,
            nan: NaN,
            sqrt: Math.sqrt,
            pow: Math.pow,
            log: Math.log,
            log10: (x) => Math.log(x) / Math.log(10),
            log2: (x) => Math.log(x) / Math.log(2),
            exp: Math.exp,
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            atan2: Math.atan2,
            degrees: (x) => x * 180 / Math.PI,
            radians: (x) => x * Math.PI / 180,
            ceil: Math.ceil,
            floor: Math.floor,
            trunc: Math.trunc,
            fabs: Math.abs,
            factorial: (n) => {
                if (n < 0 || !Number.isInteger(n)) throw new Error('factorial() only accepts integral values');
                if (n <= 1) return 1;
                let result = 1;
                for (let i = 2; i <= n; i++) result *= i;
                return result;
            },
            gcd: (a, b) => {
                while (b) [a, b] = [b, a % b];
                return Math.abs(a);
            },
            isfinite: Number.isFinite,
            isinf: (x) => !Number.isFinite(x) && !Number.isNaN(x),
            isnan: Number.isNaN
        };
    }

    createTimeModule() {
        return {
            __name__: 'time',
            time: () => Date.now() / 1000,
            sleep: (seconds) => {
                // Note: This is a no-op in this environment
                return Promise.resolve();
            },
            perf_counter: () => performance.now() / 1000,
            process_time: () => performance.now() / 1000,
            monotonic: () => performance.now() / 1000,
            strftime: (format, t) => {
                const date = t ? new Date(t * 1000) : new Date();
                return format
                    .replace('%Y', date.getFullYear())
                    .replace('%m', String(date.getMonth() + 1).padStart(2, '0'))
                    .replace('%d', String(date.getDate()).padStart(2, '0'))
                    .replace('%H', String(date.getHours()).padStart(2, '0'))
                    .replace('%M', String(date.getMinutes()).padStart(2, '0'))
                    .replace('%S', String(date.getSeconds()).padStart(2, '0'));
            }
        };
    }

    createJsonModule() {
        return {
            __name__: 'json',
            dumps: (obj, indent) => {
                if (indent !== undefined) {
                    return JSON.stringify(obj, null, indent);
                }
                return JSON.stringify(obj);
            },
            loads: JSON.parse,
            dump: (obj, fp, indent) => {
                const jsonStr = indent !== undefined ? JSON.stringify(obj, null, indent) : JSON.stringify(obj);
                fp.write(jsonStr);
            },
            load: (fp) => JSON.parse(fp.read())
        };
    }

    createCollectionsModule() {
        return {
            __name__: 'collections',
            namedtuple: (typename, field_names) => {
                const fields = typeof field_names === 'string' ? field_names.split() : field_names;
                
                function NamedTuple(...args) {
                    for (let i = 0; i < fields.length; i++) {
                        this[fields[i]] = args[i];
                    }
                }
                
                NamedTuple.prototype._fields = fields;
                NamedTuple.prototype._asdict = function() {
                    const result = {};
                    for (const field of fields) {
                        result[field] = this[field];
                    }
                    return result;
                };
                
                return NamedTuple;
            },
            defaultdict: class DefaultDict extends Map {
                constructor(defaultFactory) {
                    super();
                    this.default_factory = defaultFactory;
                }
                
                get(key) {
                    if (!this.has(key) && this.default_factory) {
                        this.set(key, this.default_factory());
                    }
                    return super.get(key);
                }
            },
            Counter: class Counter extends Map {
                constructor(iterable) {
                    super();
                    if (iterable) {
                        for (const item of iterable) {
                            this.set(item, (this.get(item) || 0) + 1);
                        }
                    }
                }
                
                most_common(n) {
                    const entries = Array.from(this.entries()).sort((a, b) => b[1] - a[1]);
                    return n ? entries.slice(0, n) : entries;
                }
            }
        };
    }

    createRandomModule() {
        return {
            __name__: 'random',
            random: Math.random,
            randint: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a,
            choice: (seq) => seq[Math.floor(Math.random() * seq.length)],
            shuffle: (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
                return array;
            },
            sample: (population, k) => {
                const result = [];
                const indices = new Set();
                while (result.length < k && indices.size < population.length) {
                    const index = Math.floor(Math.random() * population.length);
                    if (!indices.has(index)) {
                        indices.add(index);
                        result.push(population[index]);
                    }
                }
                return result;
            },
            uniform: (a, b) => Math.random() * (b - a) + a,
            seed: (x) => { /* No-op in this implementation */ },
            gauss: (mu, sigma) => {
                // Box-Muller transform
                const u1 = Math.random();
                const u2 = Math.random();
                const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                return z0 * sigma + mu;
            }
        };
    }

    createOsModule() {
        return {
            __name__: 'os',
            name: 'posix',
            path: {
                join: (...paths) => paths.join('/'),
                dirname: (path) => {
                    const parts = path.split('/');
                    return parts.slice(0, -1).join('/') || '/';
                },
                basename: (path) => {
                    const parts = path.split('/');
                    return parts[parts.length - 1];
                },
                exists: (path) => {
                    return this.fileSystem.has(path);
                },
                isfile: (path) => {
                    const entry = this.fileSystem.get(path);
                    return entry && entry.type === 'file';
                },
                isdir: (path) => {
                    const entry = this.fileSystem.get(path);
                    return entry && entry.type === 'directory';
                },
                abspath: (path) => {
                    if (path.startsWith('/')) return path;
                    return this.currentDir + '/' + path;
                },
                splitext: (path) => {
                    const lastDot = path.lastIndexOf('.');
                    if (lastDot === -1) return [path, ''];
                    return [path.substring(0, lastDot), path.substring(lastDot)];
                }
            },
            environ: {
                get: (key, default_value = null) => {
                    const env = {
                        'HOME': '/home/user',
                        'PATH': '/usr/bin:/bin',
                        'USER': 'user',
                        'PYTHONPATH': '/workspace'
                    };
                    return env[key] || default_value;
                },
                __getitem__: (key) => {
                    const value = this.environ.get(key);
                    if (value === null) throw new Error(`KeyError: '${key}'`);
                    return value;
                }
            },
            getcwd: () => this.currentDir,
            chdir: (path) => {
                if (this.fileSystem.get(path)?.type === 'directory') {
                    this.currentDir = path;
                } else {
                    throw new Error(`OSError: [Errno 2] No such file or directory: '${path}'`);
                }
            },
            listdir: (path = '.') => {
                const targetPath = path === '.' ? this.currentDir : path;
                const entries = [];
                for (const [filePath, entry] of this.fileSystem) {
                    if (filePath.startsWith(targetPath + '/') && 
                        !filePath.substring(targetPath.length + 1).includes('/')) {
                        entries.push(entry.name);
                    }
                }
                return entries;
            },
            makedirs: (path, exist_ok = false) => {
                if (this.fileSystem.has(path)) {
                    if (!exist_ok) throw new Error(`OSError: [Errno 17] File exists: '${path}'`);
                    return;
                }
                this.fileSystem.set(path, {
                    type: 'directory',
                    name: path.split('/').pop(),
                    created: new Date()
                });
            },
            mkdir: (path) => {
                if (this.fileSystem.has(path)) {
                    throw new Error(`OSError: [Errno 17] File exists: '${path}'`);
                }
                this.fileSystem.set(path, {
                    type: 'directory',
                    name: path.split('/').pop(),
                    created: new Date()
                });
            },
            remove: (path) => {
                const entry = this.fileSystem.get(path);
                if (!entry) {
                    throw new Error(`OSError: [Errno 2] No such file or directory: '${path}'`);
                }
                if (entry.type === 'directory') {
                    throw new Error(`OSError: [Errno 21] Is a directory: '${path}'`);
                }
                this.fileSystem.delete(path);
            },
            rmdir: (path) => {
                const entry = this.fileSystem.get(path);
                if (!entry) {
                    throw new Error(`OSError: [Errno 2] No such file or directory: '${path}'`);
                }
                if (entry.type !== 'directory') {
                    throw new Error(`OSError: [Errno 20] Not a directory: '${path}'`);
                }
                this.fileSystem.delete(path);
            },
            rename: (src, dst) => {
                const entry = this.fileSystem.get(src);
                if (!entry) {
                    throw new Error(`OSError: [Errno 2] No such file or directory: '${src}'`);
                }
                this.fileSystem.delete(src);
                entry.name = dst.split('/').pop();
                this.fileSystem.set(dst, entry);
            }
        };
    }

    createIoModule() {
        return {
            __name__: 'io',
            DEFAULT_BUFFER_SIZE: 8192,
            SEEK_SET: 0,
            SEEK_CUR: 1,
            SEEK_END: 2,
            
            IOError: class IOError extends Error {
                constructor(message) {
                    super(message);
                    this.name = 'IOError';
                }
            },
            
            BlockingIOError: class BlockingIOError extends Error {
                constructor(message) {
                    super(message);
                    this.name = 'BlockingIOError';
                }
            },
            
            UnsupportedOperation: class UnsupportedOperation extends Error {
                constructor(message) {
                    super(message);
                    this.name = 'UnsupportedOperation';
                }
            },
            
            StringIO: class StringIO {
                constructor(initial_value = '') {
                    this._buffer = initial_value;
                    this._position = 0;
                    this._closed = false;
                }
                
                read(size = -1) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    if (size === -1) {
                        const result = this._buffer.substring(this._position);
                        this._position = this._buffer.length;
                        return result;
                    } else {
                        const result = this._buffer.substring(this._position, this._position + size);
                        this._position += result.length;
                        return result;
                    }
                }
                
                readline(size = -1) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    const start = this._position;
                    let end = this._buffer.indexOf('\n', start);
                    if (end === -1) {
                        end = this._buffer.length;
                    } else {
                        end += 1;
                    }
                    if (size !== -1 && end - start > size) {
                        end = start + size;
                    }
                    const result = this._buffer.substring(start, end);
                    this._position = end;
                    return result;
                }
                
                readlines(hint = -1) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    const lines = [];
                    let total_size = 0;
                    while (true) {
                        const line = this.readline();
                        if (!line) break;
                        lines.push(line);
                        total_size += line.length;
                        if (hint !== -1 && total_size >= hint) break;
                    }
                    return lines;
                }
                
                write(s) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    s = String(s);
                    if (this._position === this._buffer.length) {
                        this._buffer += s;
                    } else {
                        this._buffer = this._buffer.substring(0, this._position) + 
                                      s + 
                                      this._buffer.substring(this._position + s.length);
                    }
                    this._position += s.length;
                    return s.length;
                }
                
                writelines(lines) {
                    for (const line of lines) {
                        this.write(line);
                    }
                }
                
                seek(pos, whence = 0) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    if (whence === 0) {
                        this._position = pos;
                    } else if (whence === 1) {
                        this._position += pos;
                    } else if (whence === 2) {
                        this._position = this._buffer.length + pos;
                    }
                    this._position = Math.max(0, Math.min(this._position, this._buffer.length));
                    return this._position;
                }
                
                tell() {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    return this._position;
                }
                
                close() {
                    this._closed = true;
                }
                
                get closed() {
                    return this._closed;
                }
                
                getvalue() {
                    return this._buffer;
                }
                
                truncate(size = null) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    if (size === null) {
                        size = this._position;
                    }
                    this._buffer = this._buffer.substring(0, size);
                    if (this._position > size) {
                        this._position = size;
                    }
                    return size;
                }
            },
            
            BytesIO: class BytesIO {
                constructor(initial_bytes = '') {
                    if (typeof initial_bytes === 'string') {
                        this._buffer = initial_bytes;
                    } else {
                        this._buffer = String(initial_bytes);
                    }
                    this._position = 0;
                    this._closed = false;
                }
                
                read(size = -1) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    if (size === -1) {
                        const result = this._buffer.substring(this._position);
                        this._position = this._buffer.length;
                        return result;
                    } else {
                        const result = this._buffer.substring(this._position, this._position + size);
                        this._position += result.length;
                        return result;
                    }
                }
                
                write(b) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    const strData = String(b);
                    if (this._position === this._buffer.length) {
                        this._buffer += strData;
                    } else {
                        this._buffer = this._buffer.substring(0, this._position) + 
                                      strData + 
                                      this._buffer.substring(this._position + strData.length);
                    }
                    this._position += strData.length;
                    return strData.length;
                }
                
                seek(pos, whence = 0) {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    if (whence === 0) {
                        this._position = pos;
                    } else if (whence === 1) {
                        this._position += pos;
                    } else if (whence === 2) {
                        this._position = this._buffer.length + pos;
                    }
                    this._position = Math.max(0, Math.min(this._position, this._buffer.length));
                    return this._position;
                }
                
                tell() {
                    if (this._closed) {
                        throw new Error('I/O operation on closed file');
                    }
                    return this._position;
                }
                
                close() {
                    this._closed = true;
                }
                
                get closed() {
                    return this._closed;
                }
                
                getvalue() {
                    return this._buffer;
                }
            },
            
            open: (file, mode = 'r', buffering = -1, encoding = null, errors = null, newline = null, closefd = true, opener = null) => {
                return this.createFileObject(file, mode, encoding || 'utf-8');
            }
        };
    }

    async createModuleObject(name, code) {
        const moduleScope = {
            __name__: name,
            __file__: `${this.stdlibPath}${name}.py`,
        };
        
        this.pushScope(moduleScope);
        try {
            await this.executeCode(code);
            const moduleObj = { ...this.getCurrentScope() };
            return moduleObj;
        } finally {
            this.popScope();
        }
    }

    tokenize(code) {
        const tokens = [];
        const patterns = [
            { type: 'WHITESPACE', regex: /^\s+/ },
            { type: 'COMMENT', regex: /^#.*/ },
            { type: 'NUMBER', regex: /^\d+\.?\d*/ },
            { type: 'STRING', regex: /^["']([^"'\\]|\\.)*["']/ },
            { type: 'MULTILINE_STRING', regex: /^(""".*?"""|'''.*?''')/s },
            { type: 'IDENTIFIER', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
            { type: 'OPERATOR', regex: /^(\*\*=|\*\*|\/\/=|\/\/|<<=|<<|>>=|>>|<=|>=|==|!=|<>|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|&&|\|\||<<|>>|[+\-*\/%=<>&|^~!])/ },
            { type: 'DELIMITER', regex: /^[(),\[\]{}:;.,]/ },
            { type: 'NEWLINE', regex: /^\n/ },
            { type: 'INDENT', regex: /^[ \t]+/ }
        ];

        let position = 0;
        let line = 1;
        let column = 1;

        while (position < code.length) {
            let matched = false;
            
            for (const pattern of patterns) {
                const match = code.slice(position).match(pattern.regex);
                if (match) {
                    const value = match[0];
                    if (pattern.type !== 'WHITESPACE' && pattern.type !== 'COMMENT') {
                        tokens.push({
                            type: pattern.type,
                            value: value,
                            line: line,
                            column: column
                        });
                    }
                    
                    position += value.length;
                    if (value.includes('\n')) {
                        line += value.split('\n').length - 1;
                        column = value.length - value.lastIndexOf('\n');
                    } else {
                        column += value.length;
                    }
                    matched = true;
                    break;
                }
            }
            
            if (!matched) {
                throw new Error(`Unexpected character '${code[position]}' at line ${line}, column ${column}`);
            }
        }
        
        return tokens;
    }

    parseExpression(tokens, index = 0) {
        return this.parseOrExpression(tokens, index);
    }

    parseOrExpression(tokens, index) {
        let [left, newIndex] = this.parseAndExpression(tokens, index);
        
        while (newIndex < tokens.length && tokens[newIndex].value === 'or') {
            newIndex++;
            const [right, nextIndex] = this.parseAndExpression(tokens, newIndex);
            left = { type: 'BinaryOp', operator: 'or', left, right };
            newIndex = nextIndex;
        }
        
        return [left, newIndex];
    }

    parseAndExpression(tokens, index) {
        let [left, newIndex] = this.parseNotExpression(tokens, index);
        
        while (newIndex < tokens.length && tokens[newIndex].value === 'and') {
            newIndex++;
            const [right, nextIndex] = this.parseNotExpression(tokens, newIndex);
            left = { type: 'BinaryOp', operator: 'and', left, right };
            newIndex = nextIndex;
        }
        
        return [left, newIndex];
    }

    parseNotExpression(tokens, index) {
        if (index < tokens.length && tokens[index].value === 'not') {
            const [operand, newIndex] = this.parseNotExpression(tokens, index + 1);
            return [{ type: 'UnaryOp', operator: 'not', operand }, newIndex];
        }
        return this.parseComparison(tokens, index);
    }

    parseComparison(tokens, index) {
        let [left, newIndex] = this.parseArithmeticExpression(tokens, index);
        
        const compOps = ['<', '>', '<=', '>=', '==', '!=', 'in', 'not in', 'is', 'is not'];
        while (newIndex < tokens.length && compOps.includes(tokens[newIndex].value)) {
            const operator = tokens[newIndex].value;
            newIndex++;
            if (operator === 'not' && newIndex < tokens.length && tokens[newIndex].value === 'in') {
                newIndex++;
                const [right, nextIndex] = this.parseArithmeticExpression(tokens, newIndex);
                left = { type: 'BinaryOp', operator: 'not in', left, right };
                newIndex = nextIndex;
            } else if (operator === 'is' && newIndex < tokens.length && tokens[newIndex].value === 'not') {
                newIndex++;
                const [right, nextIndex] = this.parseArithmeticExpression(tokens, newIndex);
                left = { type: 'BinaryOp', operator: 'is not', left, right };
                newIndex = nextIndex;
            } else {
                const [right, nextIndex] = this.parseArithmeticExpression(tokens, newIndex);
                left = { type: 'BinaryOp', operator, left, right };
                newIndex = nextIndex;
            }
        }
        
        return [left, newIndex];
    }

    parseArithmeticExpression(tokens, index) {
        let [left, newIndex] = this.parseTerm(tokens, index);
        
        while (newIndex < tokens.length && ['+', '-'].includes(tokens[newIndex].value)) {
            const operator = tokens[newIndex].value;
            newIndex++;
            const [right, nextIndex] = this.parseTerm(tokens, newIndex);
            left = { type: 'BinaryOp', operator, left, right };
            newIndex = nextIndex;
        }
        
        return [left, newIndex];
    }

    parseTerm(tokens, index) {
        let [left, newIndex] = this.parseFactor(tokens, index);
        
        while (newIndex < tokens.length && ['*', '/', '//', '%'].includes(tokens[newIndex].value)) {
            const operator = tokens[newIndex].value;
            newIndex++;
            const [right, nextIndex] = this.parseFactor(tokens, newIndex);
            left = { type: 'BinaryOp', operator, left, right };
            newIndex = nextIndex;
        }
        
        return [left, newIndex];
    }

    parseFactor(tokens, index) {
        if (index >= tokens.length) return [null, index];
        
        const token = tokens[index];
        
        if (['+', '-', '~'].includes(token.value)) {
            const [operand, newIndex] = this.parseFactor(tokens, index + 1);
            return [{ type: 'UnaryOp', operator: token.value, operand }, newIndex];
        }
        
        return this.parsePower(tokens, index);
    }

    parsePower(tokens, index) {
        let [left, newIndex] = this.parseAtom(tokens, index);
        
        if (newIndex < tokens.length && tokens[newIndex].value === '**') {
            newIndex++;
            const [right, nextIndex] = this.parseFactor(tokens, newIndex);
            left = { type: 'BinaryOp', operator: '**', left, right };
            newIndex = nextIndex;
        }
        
        return [left, newIndex];
    }

    parseAtom(tokens, index) {
        if (index >= tokens.length) return [null, index];
        
        const token = tokens[index];
        
        if (token.type === 'NUMBER') {
            const value = token.value.includes('.') ? parseFloat(token.value) : parseInt(token.value);
            return [{ type: 'Literal', value }, index + 1];
        }
        
        if (token.type === 'STRING' || token.type === 'MULTILINE_STRING') {
            const value = token.value.slice(1, -1);
            return [{ type: 'Literal', value }, index + 1];
        }
        
        if (token.type === 'IDENTIFIER') {
            let node = { type: 'Identifier', name: token.value };
            let newIndex = index + 1;
            
            while (newIndex < tokens.length) {
                if (tokens[newIndex].value === '(') {
                    const [args, nextIndex] = this.parseArguments(tokens, newIndex + 1);
                    node = { type: 'FunctionCall', function: node, arguments: args };
                    newIndex = nextIndex;
                } else if (tokens[newIndex].value === '[') {
                    const [subscript, nextIndex] = this.parseSubscript(tokens, newIndex + 1);
                    node = { type: 'Subscript', object: node, index: subscript };
                    newIndex = nextIndex;
                } else if (tokens[newIndex].value === '.') {
                    newIndex++;
                    if (newIndex < tokens.length && tokens[newIndex].type === 'IDENTIFIER') {
                        node = { type: 'Attribute', object: node, attribute: tokens[newIndex].value };
                        newIndex++;
                    } else {
                        throw new Error('Expected attribute name after "."');
                    }
                } else {
                    break;
                }
            }
            
            return [node, newIndex];
        }
        
        if (token.value === '(') {
            const [expr, newIndex] = this.parseExpression(tokens, index + 1);
            if (newIndex >= tokens.length || tokens[newIndex].value !== ')') {
                throw new Error('Expected closing parenthesis');
            }
            return [expr, newIndex + 1];
        }
        
        if (token.value === '[') {
            const [elements, newIndex] = this.parseList(tokens, index + 1);
            return [{ type: 'List', elements }, newIndex];
        }
        
        if (token.value === '{') {
            const [result, newIndex] = this.parseDictOrSet(tokens, index + 1);
            return [result, newIndex];
        }
        
        if (['True', 'False', 'None'].includes(token.value)) {
            const value = token.value === 'True' ? true : token.value === 'False' ? false : null;
            return [{ type: 'Literal', value }, index + 1];
        }
        
        throw new Error(`Unexpected token: ${token.value}`);
    }

    parseArguments(tokens, index) {
        const args = [];
        
        if (index < tokens.length && tokens[index].value === ')') {
            return [args, index + 1];
        }
        
        while (index < tokens.length) {
            const [expr, newIndex] = this.parseExpression(tokens, index);
            args.push(expr);
            index = newIndex;
            
            if (index < tokens.length && tokens[index].value === ',') {
                index++;
            } else if (index < tokens.length && tokens[index].value === ')') {
                return [args, index + 1];
            } else {
                throw new Error('Expected "," or ")" in argument list');
            }
        }
        
        throw new Error('Unexpected end of input in argument list');
    }

    parseSubscript(tokens, index) {
        const [expr, newIndex] = this.parseExpression(tokens, index);
        if (newIndex >= tokens.length || tokens[newIndex].value !== ']') {
            throw new Error('Expected closing bracket');
        }
        return [expr, newIndex + 1];
    }

    parseList(tokens, index) {
        const elements = [];
        
        if (index < tokens.length && tokens[index].value === ']') {
            return [elements, index + 1];
        }
        
        while (index < tokens.length) {
            const [expr, newIndex] = this.parseExpression(tokens, index);
            elements.push(expr);
            index = newIndex;
            
            if (index < tokens.length && tokens[index].value === ',') {
                index++;
            } else if (index < tokens.length && tokens[index].value === ']') {
                return [elements, index + 1];
            } else {
                throw new Error('Expected "," or "]" in list');
            }
        }
        
        throw new Error('Unexpected end of input in list');
    }

    parseDictOrSet(tokens, index) {
        if (index < tokens.length && tokens[index].value === '}') {
            return [{ type: 'Dict', pairs: [] }, index + 1];
        }
        
        const [firstExpr, newIndex] = this.parseExpression(tokens, index);
        index = newIndex;
        
        if (index < tokens.length && tokens[index].value === ':') {
            index++;
            const [value, nextIndex] = this.parseExpression(tokens, index);
            const pairs = [{ key: firstExpr, value }];
            index = nextIndex;
            
            while (index < tokens.length && tokens[index].value === ',') {
                index++;
                if (index < tokens.length && tokens[index].value === '}') {
                    break;
                }
                const [keyExpr, keyIndex] = this.parseExpression(tokens, index);
                if (keyIndex >= tokens.length || tokens[keyIndex].value !== ':') {
                    throw new Error('Expected ":" in dictionary');
                }
                const [valueExpr, valueIndex] = this.parseExpression(tokens, keyIndex + 1);
                pairs.push({ key: keyExpr, value: valueExpr });
                index = valueIndex;
            }
            
            if (index >= tokens.length || tokens[index].value !== '}') {
                throw new Error('Expected closing brace');
            }
            
            return [{ type: 'Dict', pairs }, index + 1];
        } else {
            const elements = [firstExpr];
            
            while (index < tokens.length && tokens[index].value === ',') {
                index++;
                if (index < tokens.length && tokens[index].value === '}') {
                    break;
                }
                const [expr, nextIndex] = this.parseExpression(tokens, index);
                elements.push(expr);
                index = nextIndex;
            }
            
            if (index >= tokens.length || tokens[index].value !== '}') {
                throw new Error('Expected closing brace');
            }
            
            return [{ type: 'Set', elements }, index + 1];
        }
    }

    async evaluateNode(node) {
        if (!node) return null;
        
        switch (node.type) {
            case 'Literal':
                return node.value;
                
            case 'Identifier':
                return this.getVariable(node.name);
                
            case 'BinaryOp':
                return await this.evaluateBinaryOp(node);
                
            case 'UnaryOp':
                return await this.evaluateUnaryOp(node);
                
            case 'FunctionCall':
                return await this.evaluateFunctionCall(node);
                
            case 'Attribute':
                return await this.evaluateAttribute(node);
                
            case 'Subscript':
                return await this.evaluateSubscript(node);
                
            case 'List':
                const elements = [];
                for (const element of node.elements) {
                    elements.push(await this.evaluateNode(element));
                }
                return elements;
                
            case 'Dict':
                const dict = {};
                for (const pair of node.pairs) {
                    const key = await this.evaluateNode(pair.key);
                    const value = await this.evaluateNode(pair.value);
                    dict[key] = value;
                }
                return dict;
                
            case 'Set':
                const setElements = [];
                for (const element of node.elements) {
                    setElements.push(await this.evaluateNode(element));
                }
                return new Set(setElements);
                
            case 'FString':
                return await this.evaluateFString(node);
                
            case 'ListComprehension':
                return await this.evaluateListComprehension(node);
                
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    async evaluateFString(node) {
        let result = '';
        
        for (const part of node.parts) {
            if (part.type === 'literal') {
                result += part.value;
            } else if (part.type === 'expression') {
                try {
                    const expr = this.parseSimpleExpression(part.value);
                    const value = await this.evaluateNode(expr);
                    result += this.toString(value);
                } catch (error) {
                    result += `{${part.value}}`;
                }
            }
        }
        
        return result;
    }

    async evaluateListComprehension(node) {
        const result = [];
        const iterable = await this.evaluateNode(node.iterable);
        
        if (!iterable || typeof iterable[Symbol.iterator] !== 'function') {
            throw new Error(`'${typeof iterable}' object is not iterable`);
        }
        
        this.pushScope();
        try {
            for (const item of iterable) {
                this.setVariable(node.variable, item);
                const value = await this.evaluateNode(node.element);
                result.push(value);
            }
        } finally {
            this.popScope();
        }
        
        return result;
    }

    async evaluateBinaryOp(node) {
        const left = await this.evaluateNode(node.left);
        
        if (node.operator === 'and') {
            return left ? await this.evaluateNode(node.right) : left;
        }
        if (node.operator === 'or') {
            return left ? left : await this.evaluateNode(node.right);
        }
        
        const right = await this.evaluateNode(node.right);
        
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            case '//': return Math.floor(left / right);
            case '%': return left % right;
            case '**': return Math.pow(left, right);
            case '<': return left < right;
            case '>': return left > right;
            case '<=': return left <= right;
            case '>=': return left >= right;
            case '==': return left === right;
            case '!=': return left !== right;
            case 'in': return Array.isArray(right) ? right.includes(left) : (typeof right === 'string' ? right.includes(left) : left in right);
            case 'not in': return !(Array.isArray(right) ? right.includes(left) : (typeof right === 'string' ? right.includes(left) : left in right));
            case 'is': return left === right;
            case 'is not': return left !== right;
            default: throw new Error(`Unknown binary operator: ${node.operator}`);
        }
    }

    async evaluateUnaryOp(node) {
        const operand = await this.evaluateNode(node.operand);
        
        switch (node.operator) {
            case '+': return +operand;
            case '-': return -operand;
            case '~': return ~operand;
            case 'not': return !operand;
            default: throw new Error(`Unknown unary operator: ${node.operator}`);
        }
    }

    async evaluateFunctionCall(node) {
        const func = await this.evaluateNode(node.function);
        const args = [];
        for (const arg of node.arguments) {
            args.push(await this.evaluateNode(arg));
        }
        
        if (typeof func === 'function') {
            return func(...args);
        }
        
        throw new Error(`'${typeof func}' object is not callable`);
    }

    async evaluateAttribute(node) {
        const obj = await this.evaluateNode(node.object);
        
        if (obj && typeof obj === 'object' && node.attribute in obj) {
            return obj[node.attribute];
        }
        
        throw new Error(`'${typeof obj}' object has no attribute '${node.attribute}'`);
    }

    async evaluateSubscript(node) {
        const obj = await this.evaluateNode(node.object);
        const index = await this.evaluateNode(node.index);
        
        if (Array.isArray(obj) || typeof obj === 'string') {
            const len = obj.length;
            const idx = index < 0 ? len + index : index;
            if (idx < 0 || idx >= len) {
                throw new Error(`${Array.isArray(obj) ? 'list' : 'string'} index out of range`);
            }
            return obj[idx];
        }
        
        if (typeof obj === 'object' && obj !== null) {
            if (!(index in obj)) {
                throw new Error(`KeyError: '${index}'`);
            }
            return obj[index];
        }
        
        throw new Error(`'${typeof obj}' object is not subscriptable`);
    }

    parseStatements(code) {
        const lines = code.split('\n');
        const statements = [];
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i].trim();
            
            if (!line || line.startsWith('#')) {
                i++;
                continue;
            }
            
            if (line.startsWith('import ') || line.startsWith('from ')) {
                statements.push(this.parseImport(line));
                i++;
            } else if (line.startsWith('def ')) {
                const [funcDef, newIndex] = this.parseFunction(lines, i);
                statements.push(funcDef);
                i = newIndex;
            } else if (line.startsWith('class ')) {
                const [classDef, newIndex] = this.parseClass(lines, i);
                statements.push(classDef);
                i = newIndex;
            } else if (line.startsWith('for ')) {
                const [forLoop, newIndex] = this.parseForLoop(lines, i);
                statements.push(forLoop);
                i = newIndex;
            } else if (line.startsWith('while ')) {
                const [whileLoop, newIndex] = this.parseWhileLoop(lines, i);
                statements.push(whileLoop);
                i = newIndex;
            } else if (line.startsWith('if ')) {
                const [ifStmt, newIndex] = this.parseIfStatement(lines, i);
                statements.push(ifStmt);
                i = newIndex;
            } else if (line.startsWith('try:')) {
                const [tryStmt, newIndex] = this.parseTryStatement(lines, i);
                statements.push(tryStmt);
                i = newIndex;
            } else if (line.startsWith('with ')) {
                const [withStmt, newIndex] = this.parseWithStatement(lines, i);
                statements.push(withStmt);
                i = newIndex;
            } else if (line === 'pass' || line === 'break' || line === 'continue' || line.startsWith('return') || line.startsWith('yield') || line.startsWith('raise')) {
                statements.push(this.parseControlStatement(line));
                i++;
            } else {
                // Try to parse as assignment or expression
                try {
                    const tokens = this.tokenize(line);
                    if (this.isAssignment(tokens)) {
                        statements.push(this.parseAssignment(tokens));
                    } else {
                        const [expr] = this.parseExpression(tokens);
                        statements.push({ type: 'ExpressionStatement', expression: expr });
                    }
                } catch (error) {
                    // If parsing fails, try simple statement parsing
                    if (line.includes('=') && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
                        const equalIndex = line.indexOf('=');
                        const target = line.substring(0, equalIndex).trim();
                        const value = line.substring(equalIndex + 1).trim();
                        statements.push({
                            type: 'Assignment',
                            target: { type: 'Identifier', name: target },
                            value: this.parseSimpleExpression(value)
                        });
                    } else {
                        statements.push({
                            type: 'ExpressionStatement',
                            expression: this.parseSimpleExpression(line)
                        });
                    }
                }
                i++;
            }
        }
        
        return statements;
    }

    parseSimpleExpression(expr) {
        expr = expr.trim();
        
        // Handle string literals
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            return { type: 'Literal', value: expr.slice(1, -1) };
        }
        
        // Handle f-strings
        if (expr.startsWith('f"') || expr.startsWith("f'")) {
            return this.parseFString(expr);
        }
        
        // Handle numbers
        if (/^\d+\.?\d*$/.test(expr)) {
            return { type: 'Literal', value: expr.includes('.') ? parseFloat(expr) : parseInt(expr) };
        }
        
        // Handle boolean literals
        if (expr === 'True') return { type: 'Literal', value: true };
        if (expr === 'False') return { type: 'Literal', value: false };
        if (expr === 'None') return { type: 'Literal', value: null };
        
        // Handle lists
        if (expr.startsWith('[') && expr.endsWith(']')) {
            const content = expr.slice(1, -1).trim();
            if (!content) return { type: 'List', elements: [] };
            
            const elements = content.split(',').map(item => this.parseSimpleExpression(item.trim()));
            return { type: 'List', elements };
        }
        
        // Handle dictionaries
        if (expr.startsWith('{') && expr.endsWith('}')) {
            const content = expr.slice(1, -1).trim();
            if (!content) return { type: 'Dict', pairs: [] };
            
            const pairs = [];
            const items = content.split(',');
            for (const item of items) {
                const colonIndex = item.indexOf(':');
                if (colonIndex > 0) {
                    const key = this.parseSimpleExpression(item.substring(0, colonIndex).trim());
                    const value = this.parseSimpleExpression(item.substring(colonIndex + 1).trim());
                    pairs.push({ key, value });
                }
            }
            return { type: 'Dict', pairs };
        }
        
        // Handle function calls
        const funcCallMatch = expr.match(/^(\w+)\s*\(([^)]*)\)$/);
        if (funcCallMatch) {
            const funcName = funcCallMatch[1];
            const argsStr = funcCallMatch[2].trim();
            const args = argsStr ? argsStr.split(',').map(arg => this.parseSimpleExpression(arg.trim())) : [];
            return {
                type: 'FunctionCall',
                function: { type: 'Identifier', name: funcName },
                arguments: args
            };
        }
        
        // Handle list comprehension
        const listCompMatch = expr.match(/^\[(.+?)\s+for\s+(\w+)\s+in\s+(.+?)\]$/);
        if (listCompMatch) {
            return {
                type: 'ListComprehension',
                element: this.parseSimpleExpression(listCompMatch[1].trim()),
                variable: listCompMatch[2],
                iterable: this.parseSimpleExpression(listCompMatch[3].trim())
            };
        }
        
        // Handle subscript access
        const subscriptMatch = expr.match(/^(\w+)\[(.+?)\]$/);
        if (subscriptMatch) {
            return {
                type: 'Subscript',
                object: { type: 'Identifier', name: subscriptMatch[1] },
                index: this.parseSimpleExpression(subscriptMatch[2])
            };
        }
        
        // Handle attribute access
        if (expr.includes('.')) {
            const parts = expr.split('.');
            let result = { type: 'Identifier', name: parts[0] };
            for (let i = 1; i < parts.length; i++) {
                result = { type: 'Attribute', object: result, attribute: parts[i] };
            }
            return result;
        }
        
        // Default to identifier
        return { type: 'Identifier', name: expr };
    }

    parseFString(expr) {
        // Simple f-string parsing - extract variables in {}
        const content = expr.slice(2, -1); // Remove f" and "
        const parts = [];
        let current = '';
        let inBrace = false;
        let braceCount = 0;
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            
            if (char === '{' && !inBrace) {
                if (current) {
                    parts.push({ type: 'literal', value: current });
                    current = '';
                }
                inBrace = true;
                braceCount = 1;
            } else if (char === '{' && inBrace) {
                braceCount++;
                current += char;
            } else if (char === '}' && inBrace) {
                braceCount--;
                if (braceCount === 0) {
                    parts.push({ type: 'expression', value: current });
                    current = '';
                    inBrace = false;
                } else {
                    current += char;
                }
            } else {
                current += char;
            }
        }
        
        if (current) {
            parts.push({ type: 'literal', value: current });
        }
        
        return { type: 'FString', parts };
    }

    parseImport(line) {
        const importMatch = line.match(/^import\s+(.+)$/);
        if (importMatch) {
            const modules = importMatch[1].split(',').map(m => m.trim());
            return { type: 'Import', modules };
        }
        
        const fromMatch = line.match(/^from\s+(.+)\s+import\s+(.+)$/);
        if (fromMatch) {
            const module = fromMatch[1].trim();
            const items = fromMatch[2].split(',').map(item => {
                const asMatch = item.trim().match(/^(.+)\s+as\s+(.+)$/);
                if (asMatch) {
                    return { name: asMatch[1].trim(), alias: asMatch[2].trim() };
                }
                return { name: item.trim() };
            });
            return { type: 'FromImport', module, items };
        }
        
        throw new Error(`Invalid import statement: ${line}`);
    }

    parseFunction(lines, startIndex) {
        const line = lines[startIndex].trim();
        const match = line.match(/^def\s+(\w+)\s*\(([^)]*)\)\s*(?:->\s*(.+))?\s*:$/);
        if (!match) {
            throw new Error(`Invalid function definition: ${line}`);
        }
        
        const name = match[1];
        const params = match[2] ? match[2].split(',').map(p => p.trim()).filter(p => p) : [];
        const returnType = match[3] ? match[3].trim() : null;
        
        const [body, endIndex] = this.parseBlock(lines, startIndex + 1);
        
        return [{ type: 'FunctionDef', name, params, returnType, body }, endIndex];
    }

    parseClass(lines, startIndex) {
        const line = lines[startIndex].trim();
        const match = line.match(/^class\s+(\w+)(?:\s*\(([^)]*)\))?\s*:$/);
        if (!match) {
            throw new Error(`Invalid class definition: ${line}`);
        }
        
        const name = match[1];
        const bases = match[2] ? match[2].split(',').map(b => b.trim()).filter(b => b) : [];
        
        const [body, endIndex] = this.parseBlock(lines, startIndex + 1);
        
        return [{ type: 'ClassDef', name, bases, body }, endIndex];
    }

    parseForLoop(lines, startIndex) {
        const line = lines[startIndex].trim();
        const match = line.match(/^for\s+(\w+)\s+in\s+(.+?)\s*:$/);
        if (!match) {
            throw new Error(`Invalid for loop: ${line}`);
        }
        
        const variable = match[1];
        const tokens = this.tokenize(match[2]);
        const [iterable] = this.parseExpression(tokens);
        
        const [body, endIndex] = this.parseBlock(lines, startIndex + 1);
        
        return [{ type: 'ForLoop', variable, iterable, body }, endIndex];
    }

    parseWhileLoop(lines, startIndex) {
        const line = lines[startIndex].trim();
        const match = line.match(/^while\s+(.+?)\s*:$/);
        if (!match) {
            throw new Error(`Invalid while loop: ${line}`);
        }
        
        const tokens = this.tokenize(match[1]);
        const [condition] = this.parseExpression(tokens);
        
        const [body, endIndex] = this.parseBlock(lines, startIndex + 1);
        
        return [{ type: 'WhileLoop', condition, body }, endIndex];
    }

    parseIfStatement(lines, startIndex) {
        const line = lines[startIndex].trim();
        const match = line.match(/^if\s+(.+?)\s*:$/);
        if (!match) {
            throw new Error(`Invalid if statement: ${line}`);
        }
        
        const tokens = this.tokenize(match[1]);
        const [condition] = this.parseExpression(tokens);
        
        const [body, nextIndex] = this.parseBlock(lines, startIndex + 1);
        let currentIndex = nextIndex;
        
        const elifBranches = [];
        let elseBranch = null;
        
        while (currentIndex < lines.length) {
            const nextLine = lines[currentIndex].trim();
            
            if (nextLine.startsWith('elif ')) {
                const elifMatch = nextLine.match(/^elif\s+(.+?)\s*:$/);
                if (!elifMatch) {
                    throw new Error(`Invalid elif statement: ${nextLine}`);
                }
                
                const elifTokens = this.tokenize(elifMatch[1]);
                const [elifCondition] = this.parseExpression(elifTokens);
                const [elifBody, elifEndIndex] = this.parseBlock(lines, currentIndex + 1);
                
                elifBranches.push({ condition: elifCondition, body: elifBody });
                currentIndex = elifEndIndex;
            } else if (nextLine === 'else:') {
                const [elseBody, elseEndIndex] = this.parseBlock(lines, currentIndex + 1);
                elseBranch = elseBody;
                currentIndex = elseEndIndex;
                break;
            } else {
                break;
            }
        }
        
        return [{ type: 'IfStatement', condition, body, elifBranches, elseBranch }, currentIndex];
    }

    parseTryStatement(lines, startIndex) {
        const [body, nextIndex] = this.parseBlock(lines, startIndex + 1);
        let currentIndex = nextIndex;
        
        const exceptClauses = [];
        let elseBranch = null;
        let finallyBranch = null;
        
        while (currentIndex < lines.length) {
            const line = lines[currentIndex].trim();
            
            if (line.startsWith('except')) {
                const exceptMatch = line.match(/^except(?:\s+(.+?))?\s*:$/);
                const exceptionType = exceptMatch[1] || null;
                const [exceptBody, exceptEndIndex] = this.parseBlock(lines, currentIndex + 1);
                exceptClauses.push({ exceptionType, body: exceptBody });
                currentIndex = exceptEndIndex;
            } else if (line === 'else:') {
                const [elseBody, elseEndIndex] = this.parseBlock(lines, currentIndex + 1);
                elseBranch = elseBody;
                currentIndex = elseEndIndex;
            } else if (line === 'finally:') {
                const [finallyBody, finallyEndIndex] = this.parseBlock(lines, currentIndex + 1);
                finallyBranch = finallyBody;
                currentIndex = finallyEndIndex;
                break;
            } else {
                break;
            }
        }
        
        return [{ type: 'TryStatement', body, exceptClauses, elseBranch, finallyBranch }, currentIndex];
    }

    parseWithStatement(lines, startIndex) {
        const line = lines[startIndex].trim();
        const match = line.match(/^with\s+(.+?)\s*:$/);
        if (!match) {
            throw new Error(`Invalid with statement: ${line}`);
        }
        
        const tokens = this.tokenize(match[1]);
        const [context] = this.parseExpression(tokens);
        
        const [body, endIndex] = this.parseBlock(lines, startIndex + 1);
        
        return [{ type: 'WithStatement', context, body }, endIndex];
    }

    parseControlStatement(line) {
        if (line === 'pass') {
            return { type: 'Pass' };
        } else if (line === 'break') {
            return { type: 'Break' };
        } else if (line === 'continue') {
            return { type: 'Continue' };
        } else if (line.startsWith('return')) {
            const returnMatch = line.match(/^return(?:\s+(.+))?$/);
            const value = returnMatch[1] ? this.parseExpression(this.tokenize(returnMatch[1]))[0] : null;
            return { type: 'Return', value };
        } else if (line.startsWith('yield')) {
            const yieldMatch = line.match(/^yield(?:\s+(.+))?$/);
            const value = yieldMatch[1] ? this.parseExpression(this.tokenize(yieldMatch[1]))[0] : null;
            return { type: 'Yield', value };
        } else if (line.startsWith('raise')) {
            const raiseMatch = line.match(/^raise(?:\s+(.+))?$/);
            const exception = raiseMatch[1] ? this.parseExpression(this.tokenize(raiseMatch[1]))[0] : null;
            return { type: 'Raise', exception };
        }
        
        throw new Error(`Unknown control statement: ${line}`);
    }

    parseBlock(lines, startIndex) {
        const statements = [];
        let currentIndex = startIndex;
        const expectedIndent = this.getIndentation(lines[startIndex] || '');
        
        while (currentIndex < lines.length) {
            const line = lines[currentIndex];
            const trimmedLine = line.trim();
            
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                currentIndex++;
                continue;
            }
            
            const indent = this.getIndentation(line);
            if (indent < expectedIndent) {
                break;
            }
            
            if (indent > expectedIndent) {
                throw new Error(`Unexpected indentation at line ${currentIndex + 1}`);
            }
            
            const subStatements = this.parseStatements(trimmedLine);
            statements.push(...subStatements);
            currentIndex++;
        }
        
        return [statements, currentIndex];
    }

    getIndentation(line) {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    isAssignment(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].value === '=' && (i === 0 || tokens[i-1].value !== '=' && tokens[i-1].value !== '!' && tokens[i-1].value !== '<' && tokens[i-1].value !== '>')) {
                return true;
            }
        }
        return false;
    }

    parseAssignment(tokens) {
        let equalIndex = -1;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].value === '=' && (i === 0 || tokens[i-1].value !== '=' && tokens[i-1].value !== '!' && tokens[i-1].value !== '<' && tokens[i-1].value !== '>')) {
                equalIndex = i;
                break;
            }
        }
        
        if (equalIndex === -1) {
            throw new Error('Assignment operator not found');
        }
        
        const targetTokens = tokens.slice(0, equalIndex);
        const valueTokens = tokens.slice(equalIndex + 1);
        
        const [target] = this.parseExpression(targetTokens);
        const [value] = this.parseExpression(valueTokens);
        
        return { type: 'Assignment', target, value };
    }

    async executeCode(code) {
        this.printOutput = [];
        
        try {
            const statements = this.parseStatements(code);
            let result = null;
            
            for (const statement of statements) {
                result = await this.executeStatement(statement);
                if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                    break;
                }
            }
            
            this.logExecution(`Executed ${statements.length} statements`);
            return this.printOutput.join('\n');
        } catch (error) {
            this.logExecution(`Execution error: ${error.message}`);
            throw error;
        }
    }

    async executeStatement(statement) {
        if (!statement) return null;
        
        switch (statement.type) {
            case 'Import':
                return await this.executeImport(statement);
                
            case 'FromImport':
                return await this.executeFromImport(statement);
                
            case 'Assignment':
                return await this.executeAssignment(statement);
                
            case 'ExpressionStatement':
                return await this.evaluateNode(statement.expression);
                
            case 'FunctionDef':
                return this.executeFunctionDef(statement);
                
            case 'ClassDef':
                return this.executeClassDef(statement);
                
            case 'ForLoop':
                return await this.executeForLoop(statement);
                
            case 'WhileLoop':
                return await this.executeWhileLoop(statement);
                
            case 'IfStatement':
                return await this.executeIfStatement(statement);
                
            case 'TryStatement':
                return await this.executeTryStatement(statement);
                
            case 'WithStatement':
                return await this.executeWithStatement(statement);
                
            case 'Return':
                const returnValue = statement.value ? await this.evaluateNode(statement.value) : null;
                return { type: 'return', value: returnValue };
                
            case 'Yield':
                const yieldValue = statement.value ? await this.evaluateNode(statement.value) : null;
                return { type: 'yield', value: yieldValue };
                
            case 'Break':
                return { type: 'break' };
                
            case 'Continue':
                return { type: 'continue' };
                
            case 'Pass':
                return null;
                
            case 'Raise':
                const exception = statement.exception ? await this.evaluateNode(statement.exception) : new Error('Exception');
                throw exception;
                
            default:
                throw new Error(`Unknown statement type: ${statement.type}`);
        }
    }

    async executeImport(statement) {
        for (const moduleName of statement.modules) {
            const module = await this.loadModule(moduleName);
            this.setVariable(moduleName, module);
        }
    }

    async executeFromImport(statement) {
        const module = await this.loadModule(statement.module);
        
        for (const item of statement.items) {
            if (item.name === '*') {
                for (const [name, value] of Object.entries(module)) {
                    if (!name.startsWith('_')) {
                        this.setVariable(name, value);
                    }
                }
            } else {
                if (!(item.name in module)) {
                    throw new Error(`cannot import name '${item.name}' from '${statement.module}'`);
                }
                const varName = item.alias || item.name;
                this.setVariable(varName, module[item.name]);
            }
        }
    }

    async executeAssignment(statement) {
        const value = await this.evaluateNode(statement.value);
        
        if (statement.target.type === 'Identifier') {
            this.setVariable(statement.target.name, value);
        } else if (statement.target.type === 'Subscript') {
            const obj = await this.evaluateNode(statement.target.object);
            const index = await this.evaluateNode(statement.target.index);
            obj[index] = value;
        } else if (statement.target.type === 'Attribute') {
            const obj = await this.evaluateNode(statement.target.object);
            obj[statement.target.attribute] = value;
        } else {
            throw new Error(`Invalid assignment target: ${statement.target.type}`);
        }
        
        return value;
    }

    executeFunctionDef(statement) {
        const func = async (...args) => {
            this.pushScope();
            
            try {
                for (let i = 0; i < statement.params.length; i++) {
                    this.setVariable(statement.params[i], args[i]);
                }
                
                for (const stmt of statement.body) {
                    const result = await this.executeStatement(stmt);
                    if (result && result.type === 'return') {
                        return result.value;
                    }
                }
                
                return null;
            } finally {
                this.popScope();
            }
        };
        
        func.__name__ = statement.name;
        func.__doc__ = null;
        
        this.setVariable(statement.name, func);
        this.functions.set(statement.name, statement);
        
        return func;
    }

    executeClassDef(statement) {
        const classConstructor = function(...args) {
            const instance = {};
            instance.__class__ = statement.name;
            
            // Copy class methods to instance
            for (const [name, method] of Object.entries(classConstructor.prototype)) {
                if (typeof method === 'function') {
                    instance[name] = function(...methodArgs) {
                        return method.call(instance, ...methodArgs);
                    };
                }
            }
            
            // Call __init__ if it exists
            if (typeof instance.__init__ === 'function') {
                instance.__init__(...args);
            }
            
            return instance;
        };
        
        classConstructor.__name__ = statement.name;
        classConstructor.prototype = {};
        
        // Execute class body in a new scope
        this.pushScope();
        
        try {
            // Set up class context
            this.setVariable('__class__', statement.name);
            
            for (const stmt of statement.body) {
                this.executeStatement(stmt);
            }
            
            // Copy all functions from class scope to prototype
            const classScope = this.getCurrentScope();
            for (const [name, value] of Object.entries(classScope)) {
                if (typeof value === 'function' && name !== '__class__') {
                    classConstructor.prototype[name] = value;
                }
            }
        } finally {
            this.popScope();
        }
        
        this.setVariable(statement.name, classConstructor);
        this.classes.set(statement.name, statement);
        
        return classConstructor;
    }

    async executeForLoop(statement) {
        const iterable = await this.evaluateNode(statement.iterable);
        
        if (!iterable || typeof iterable[Symbol.iterator] !== 'function') {
            throw new Error(`'${typeof iterable}' object is not iterable`);
        }
        
        for (const item of iterable) {
            this.setVariable(statement.variable, item);
            
            for (const stmt of statement.body) {
                const result = await this.executeStatement(stmt);
                if (result && result.type === 'break') {
                    return;
                } else if (result && result.type === 'continue') {
                    break;
                } else if (result && result.type === 'return') {
                    return result;
                }
            }
        }
    }

    async executeWhileLoop(statement) {
        while (await this.evaluateNode(statement.condition)) {
            for (const stmt of statement.body) {
                const result = await this.executeStatement(stmt);
                if (result && result.type === 'break') {
                    return;
                } else if (result && result.type === 'continue') {
                    break;
                } else if (result && result.type === 'return') {
                    return result;
                }
            }
        }
    }

    async executeIfStatement(statement) {
        if (await this.evaluateNode(statement.condition)) {
            for (const stmt of statement.body) {
                const result = await this.executeStatement(stmt);
                if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                    return result;
                }
            }
        } else {
            for (const elifBranch of statement.elifBranches) {
                if (await this.evaluateNode(elifBranch.condition)) {
                    for (const stmt of elifBranch.body) {
                        const result = await this.executeStatement(stmt);
                        if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                            return result;
                        }
                    }
                    return;
                }
            }
            
            if (statement.elseBranch) {
                for (const stmt of statement.elseBranch) {
                    const result = await this.executeStatement(stmt);
                    if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                        return result;
                    }
                }
            }
        }
    }

    async executeTryStatement(statement) {
        try {
            for (const stmt of statement.body) {
                const result = await this.executeStatement(stmt);
                if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                    return result;
                }
            }
            
            if (statement.elseBranch) {
                for (const stmt of statement.elseBranch) {
                    const result = await this.executeStatement(stmt);
                    if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                        return result;
                    }
                }
            }
        } catch (error) {
            for (const exceptClause of statement.exceptClauses) {
                if (!exceptClause.exceptionType || error instanceof this.getVariable(exceptClause.exceptionType)) {
                    for (const stmt of exceptClause.body) {
                        const result = await this.executeStatement(stmt);
                        if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                            return result;
                        }
                    }
                    break;
                }
            }
        } finally {
            if (statement.finallyBranch) {
                for (const stmt of statement.finallyBranch) {
                    await this.executeStatement(stmt);
                }
            }
        }
    }

    async executeWithStatement(statement) {
        const context = await this.evaluateNode(statement.context);
        
        if (context && typeof context.__enter__ === 'function') {
            context.__enter__();
        }
        
        try {
            for (const stmt of statement.body) {
                const result = await this.executeStatement(stmt);
                if (result && (result.type === 'return' || result.type === 'break' || result.type === 'continue')) {
                    return result;
                }
            }
        } finally {
            if (context && typeof context.__exit__ === 'function') {
                context.__exit__();
            }
        }
    }

    logExecution(message) {
        this.executionLog.push({
            timestamp: new Date().toISOString(),
            message: message
        });
    }

    getExecutionLog() {
        return this.executionLog;
    }

    reset() {
        this.globals = {};
        this.modules.clear();
        this.importedModules.clear();
        this.functions.clear();
        this.classes.clear();
        this.scopeStack = [{}];
        this.executionLog = [];
        this.printOutput = [];
        this.initializeBuiltins();
        this.initializeStandardTypes();
    }
}

const pythonInterpreter = new PythonInterpreter();

async function runPythonCode(code) {
    try {
        if (!validatePythonCode(code)) {
            return {
                success: false,
                output: 'Operation did not work',
                error: 'Invalid Python code'
            };
        }
        
        const result = await pythonInterpreter.executeCode(code);
        return {
            success: true,
            output: result || '',
            error: null
        };
    } catch (error) {
        pythonInterpreter.logExecution(`Execution error: ${error.message}`);
        return {
            success: false,
            output: 'Operation did not work',
            error: error.message
        };
    }
}

function validatePythonCode(code) {
    if (typeof code !== 'string') {
        return false;
    }
    if (code.trim().length === 0) {
        return false;
    }
    return true;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PythonInterpreter, runPythonCode, validatePythonCode };
}
