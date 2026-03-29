#!/usr/bin/env bun
"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var readline_1 = require("readline");
var child_process_1 = require("child_process");
var connection_1 = require("../src/server/db/connection");
var authSchema = require("../src/server/db/auth-schema");
var drizzle_orm_1 = require("drizzle-orm");
/**
 * remcostoeten.nl Unified API CLI
 *
 * Consolidates functionality for testing endpoints,
 * checking database status, and debugging users.
 */
var BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
var endpoints = [
    { name: 'GitHub Activity', path: '/api/github/activity', method: 'GET' },
    {
        name: 'GitHub Contributions',
        path: '/api/github/contributions',
        method: 'GET'
    },
    { name: 'GitHub Commits', path: '/api/github/commits', method: 'GET' },
    {
        name: 'GitHub Repo (remcostoeten.nl)',
        path: '/api/github/repo?owner=remcostoeten&repo=remcostoeten.nl',
        method: 'GET'
    },
    {
        name: 'Spotify Now Playing',
        path: '/api/spotify/now-playing',
        method: 'GET'
    },
    { name: 'Spotify Recent', path: '/api/spotify/recent', method: 'GET' }
];
var rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
function showMenu() {
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', '=== remcostoeten.nl Unified CLI ===');
    console.log('\x1b[32m%s\x1b[0m', '--- Database Operations ---');
    console.log('\x1b[33m1\x1b[0m: List Users (Debug)');
    console.log('\x1b[33m2\x1b[0m: Check Sync Status');
    console.log('\n\x1b[32m%s\x1b[0m', '--- API Endpoint Testing ---');
    endpoints.forEach(function (ep, i) {
        var index = i + 3;
        console.log("\u001B[33m".concat(index, "\u001B[0m: ").concat(ep.name, " \u001B[90m").concat(ep.path, "\u001B[0m"));
    });
    console.log('\n\x1b[31mq\x1b[0m: Quit');
    rl.question('\n\x1b[1mSelection: \x1b[0m', handleInput);
}
function handleInput(input) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (input.toLowerCase() === 'q') {
                        console.log('Goodbye!');
                        rl.close();
                        process.exit(0);
                    }
                    index = parseInt(input);
                    if (!(index === 1)) return [3 /*break*/, 2];
                    return [4 /*yield*/, listUsers()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 2:
                    if (!(index === 2)) return [3 /*break*/, 4];
                    return [4 /*yield*/, checkSyncStatus()];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 4:
                    if (!(index >= 3 && index < endpoints.length + 3)) return [3 /*break*/, 6];
                    return [4 /*yield*/, testEndpoint(endpoints[index - 3])];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    console.log('\n\x1b[31mInvalid selection. Try again.\x1b[0m');
                    setTimeout(showMenu, 800);
                    return [2 /*return*/];
                case 7:
                    console.log("\u001B[90m\n--------------------------------------------------\u001B[0m");
                    rl.question('Press Enter to return to menu...', function () {
                        showMenu();
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function listUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var users, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('\n\x1b[36mQuerying users...\x1b[0m');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, connection_1.db.select().from(authSchema.user)];
                case 2:
                    users = _a.sent();
                    console.log("\u001B[32mUsers found:\u001B[0m ".concat(users.length, "\n"));
                    users.forEach(function (u) {
                        console.log("- \u001B[1m".concat(u.email, "\u001B[0m (Name: ").concat(u.name, ", Role: ").concat(u.role, ")"));
                    });
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error('\n\x1b[31mError querying users:\x1b[0m', e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function checkSyncStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var githubRes, spotifyRes, metaRes, githubCount, spotifyCount, e_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('\n\x1b[36mChecking sync status...\x1b[0m');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, connection_1.db.execute((0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT count(*) FROM github_activities"], ["SELECT count(*) FROM github_activities"]))))];
                case 2:
                    githubRes = _c.sent();
                    return [4 /*yield*/, connection_1.db.execute((0, drizzle_orm_1.sql)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT count(*) FROM spotify_listens"], ["SELECT count(*) FROM spotify_listens"]))))];
                case 3:
                    spotifyRes = _c.sent();
                    return [4 /*yield*/, connection_1.db.execute((0, drizzle_orm_1.sql)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["SELECT * FROM sync_metadata"], ["SELECT * FROM sync_metadata"]))))];
                case 4:
                    metaRes = _c.sent();
                    githubCount = ((_a = githubRes.rows[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                    spotifyCount = ((_b = spotifyRes.rows[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
                    console.log("- GitHub Activities: \u001B[33m".concat(githubCount, "\u001B[0m"));
                    console.log("- Spotify Listens:    \u001B[33m".concat(spotifyCount, "\u001B[0m"));
                    if (metaRes.rows.length > 0) {
                        console.log('\n📅 Last Sync Times:');
                        console.table(metaRes.rows);
                    }
                    else {
                        console.log('\n📅 No sync metadata found yet.');
                    }
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _c.sent();
                    console.error('\n\x1b[31mError checking status:\x1b[0m', e_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function testEndpoint(endpoint) {
    return __awaiter(this, void 0, void 0, function () {
        var url, startTime, res, duration, errorText, data, curlCmd, platform, command, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = BASE_URL + endpoint.path;
                    console.log("\n\u001B[33mTesting:\u001B[0m ".concat(url));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    startTime = Date.now();
                    return [4 /*yield*/, fetch(url, {
                            headers: { Accept: 'application/json' }
                        })];
                case 2:
                    res = _a.sent();
                    duration = Date.now() - startTime;
                    if (!!res.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, res.text()];
                case 3:
                    errorText = _a.sent();
                    throw new Error("HTTP ".concat(res.status, ": ").concat(res.statusText, "\n").concat(errorText.substring(0, 100)));
                case 4: return [4 /*yield*/, res.json()];
                case 5:
                    data = _a.sent();
                    console.log("\u001B[32mStatus:\u001B[0m ".concat(res.status, " OK \u001B[90m(").concat(duration, "ms)\u001B[0m"));
                    console.log("\u001B[33mResponse snippet:\u001B[0m");
                    console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
                    curlCmd = "curl -X GET \"".concat(url, "\" -H \"Accept: application/json\"");
                    platform = process.platform;
                    command = '';
                    if (platform === 'darwin')
                        command = "echo '".concat(curlCmd, "' | pbcopy");
                    else if (platform === 'linux')
                        command = "echo '".concat(curlCmd, "' | xclip -selection clipboard || echo '").concat(curlCmd, "' | wl-copy");
                    if (command) {
                        (0, child_process_1.exec)(command, function (err) {
                            if (!err)
                                console.log('\x1b[90m(Curl command copied to clipboard)\x1b[0m');
                        });
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.log("\u001B[31m\nError:\u001B[0m ".concat(err_1.message));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Handle Ctrl+C
rl.on('SIGINT', function () {
    console.log('\nGoodbye!');
    process.exit(0);
});
showMenu();
var templateObject_1, templateObject_2, templateObject_3;
