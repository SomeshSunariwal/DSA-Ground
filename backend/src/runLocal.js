// runLocal.js - compile and run simple programs locally (with Windows C++ fix)
import fs from "fs";
import os from "os";
import path from "path";
import { exec, spawn } from "child_process";

function tmpFileName(prefix, ext) {
    const id = Date.now() + '-' + Math.floor(Math.random() * 100000);
    return path.join(os.tmpdir(), `${prefix}-${id}.${ext}`);
}

// Exec (used by Linux, Mac, Docker)
function execPromise(cmd, opts = {}) {
    return new Promise((resolve) => {
        exec(cmd, {
            timeout: opts.timeout || 5000,
            killSignal: 'SIGKILL',
            maxBuffer: 10 * 1024 * 1024
        }, (error, stdout, stderr) => {
            resolve({
                error,
                stdout: stdout ? String(stdout) : '',
                stderr: stderr ? String(stderr) : ''
            });
        });
    });
}

// Spawn (Windows fix for C++)
function spawnRun(exePath, stdin = "") {
    return new Promise((resolve) => {
        const child = spawn(exePath, []);

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", d => stdout += d.toString());
        child.stderr.on("data", d => stderr += d.toString());

        if (stdin) {
            child.stdin.write(stdin);
        }
        child.stdin.end();

        const timeout = setTimeout(() => {
            child.kill();
            resolve({ error: "TIMEOUT", stdout, stderr: "Program timed out." });
        }, 5000);

        child.on("close", () => {
            clearTimeout(timeout);
            resolve({ error: null, stdout, stderr });
        });
    });
}

export async function runLocal(language, code, stdin = '') {
    language = (language || '').toLowerCase();

    let srcPath, exePath, compileCmd, runCmd;

    try {
        if (language === 'cpp') {
            srcPath = tmpFileName('prog', 'cpp');
            exePath = tmpFileName('a.out', process.platform === "win32" ? "exe" : "out");
            fs.writeFileSync(srcPath, code);

            compileCmd = `g++ "${srcPath}" -o "${exePath}"`;
            const cRes = await execPromise(compileCmd, { timeout: 10000 });

            if (cRes.error) {
                return {
                    success: false,
                    compile: { stdout: cRes.stdout, stderr: cRes.stderr }
                };
            }

            // WINDOWS FIX:
            // ------------------------------
            // // Use spawn because echo | exe NEVER works properly on Windows
            if (process.platform === "win32") {
                const runRes = await spawnRun(exePath, stdin);
                return {
                    success: !runRes.error,
                    compile: { stdout: "", stderr: "" },
                    run: { stdout: runRes.stdout, stderr: runRes.stderr }
                };
            }
            // ------------------------------

            // Linux/macOS (or future Docker) → original logic
            runCmd = `"${exePath}"`;
        }

        else if (language === 'c') {
            srcPath = tmpFileName('prog', 'c');
            exePath = tmpFileName('a.out', process.platform === "win32" ? "exe" : "out");
            fs.writeFileSync(srcPath, code);

            compileCmd = `gcc "${srcPath}" -o "${exePath}"`;
            const cRes = await execPromise(compileCmd, { timeout: 10000 });

            if (cRes.error)
                return { success: false, compile: cRes };

            runCmd = `"${exePath}"`;
        }

        else if (language === 'python') {
            srcPath = tmpFileName('prog', 'py');
            fs.writeFileSync(srcPath, code);

            // --- Syntax Check ---
            const syntaxCheck = await execPromise(`python3 -m py_compile "${srcPath}"`);
            if (syntaxCheck.stderr && syntaxCheck.stderr.length > 0) {
                return {
                    success: false,
                    compile: { stdout: syntaxCheck.stdout, stderr: syntaxCheck.stderr }
                };
            }

            runCmd = `python3 "${srcPath}"`;
        }

        else if (language === 'java') {
            const srcDir = os.tmpdir();
            srcPath = path.join(srcDir, 'Main.java');

            fs.writeFileSync(srcPath, code);

            compileCmd = `javac "${srcPath}" -d "${srcDir}"`;
            const cRes = await execPromise(compileCmd, { timeout: 10000 });

            if (cRes.error)
                return { success: false, compile: cRes };

            runCmd = `java -cp "${srcDir}" Main`;
        }

        else if (language === 'javascript') {
            srcPath = tmpFileName('prog', 'js');
            fs.writeFileSync(srcPath, code);

            // Node.js execution
            runCmd = `node "${srcPath}"`;
        }

        // Default execution (Linux/Mac) + non-CPP Windows
        const fullRunCmd = stdin
            ? `echo "${escapeShellStdin(stdin)}" | ${runCmd}`
            : runCmd;

        const runRes = await execPromise(fullRunCmd, { timeout: 5000 });

        return {
            success: true,
            compile: compileCmd ? { stdout: '', stderr: '' } : undefined,
            run: { stdout: runRes.stdout, stderr: runRes.stderr }
        };

    } catch (err) {
        return { success: false, error: String(err) };
    }
}

function escapeShellStdin(s) {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\r/g, '')
        .replace(/\n/g, '\\n');
}


