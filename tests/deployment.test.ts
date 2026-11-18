import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {databaseConfig,DatabaseConfigurationError} from "../lib/database-config.mjs";
import {publicCatalogueExtra} from "../lib/catalogue-export";
import {validateDeploymentEnvironment} from "../lib/deployment-config.mjs";
test("Vercel cannot silently fall back to a local or temporary database",()=>{
 for(const url of [undefined,"","file:data/radio.db","file:/tmp/radio.db","file::memory:"])assert.throws(()=>databaseConfig({VERCEL:"1",DATABASE_URL:url}),DatabaseConfigurationError);
});
test("hosted database settings accept standard and Turso integration names",()=>{
 assert.deepEqual(databaseConfig({VERCEL:"1",DATABASE_URL:"libsql://database.turso.io",DATABASE_AUTH_TOKEN:"token"}),{url:"libsql://database.turso.io",authToken:"token"});
 assert.deepEqual(databaseConfig({VERCEL:"1",TURSO_DATABASE_URL:"libsql://database.turso.io",TURSO_AUTH_TOKEN:"token"}),{url:"libsql://database.turso.io",authToken:"token"});
 assert.throws(()=>databaseConfig({VERCEL:"1",DATABASE_URL:"libsql://database.turso.io"}),/DATABASE_AUTH_TOKEN/);
 assert.throws(()=>databaseConfig({VERCEL:"1",DATABASE_URL:"postgresql://database",DATABASE_AUTH_TOKEN:"token"}),/libSQL/);
 assert.throws(()=>databaseConfig({VERCEL:"1",DATABASE_URL:"http://localhost:8080",DATABASE_AUTH_TOKEN:"token"}),/secure/);
});
test("local development and isolated test databases still work",()=>{
 assert.equal(databaseConfig({}).url,"file:data/radio.db");
 assert.equal(databaseConfig({DATABASE_URL:"file::memory:"}).url,"file::memory:");
});
test("production preflight requires the live site origin and production auth keys",()=>{
 const env={VERCEL_ENV:"production",DATABASE_URL:"libsql://database.turso.io",DATABASE_AUTH_TOKEN:"token",SITE_URL:"https://upscradio.com",NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:"pk_live_example",CLERK_SECRET_KEY:"sk_live_example"};
 assert.equal(validateDeploymentEnvironment(env).url,env.DATABASE_URL);
 assert.throws(()=>validateDeploymentEnvironment({...env,SITE_URL:"http://localhost:3000"}),/SITE_URL/);
 assert.throws(()=>validateDeploymentEnvironment({...env,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:"pk_test_example"}),/production keys/);
});
test("importing the database module does not touch the filesystem in an unconfigured Vercel runtime",()=>{
 const script=`import fs from 'node:fs'; import {syncBuiltinESMExports} from 'node:module'; fs.mkdirSync=()=>{throw Error('Unexpected filesystem write')};syncBuiltinESMExports();const {getDatabase}=await import(${JSON.stringify(new URL("../lib/db.ts",import.meta.url).href)});try{getDatabase();process.exitCode=2}catch(error){if(error.name!=='DatabaseConfigurationError')throw error;console.log('Configuration rejected before filesystem access')}`;
 const result=spawnSync(process.execPath,["--import","tsx","--input-type=module","-e",script],{cwd:fileURLToPath(new URL("../",import.meta.url)),encoding:"utf8",env:{...process.env,VERCEL:"1",DATABASE_URL:"",DATABASE_AUTH_TOKEN:"",TURSO_DATABASE_URL:"",TURSO_AUTH_TOKEN:""}});
 assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/before filesystem access/);
});
test("catalogue export excludes service credentials, local document paths and nested payloads",()=>{
 const settings=publicCatalogueExtra("settings",JSON.stringify({about:"Public introduction",contact_email:"hello@example.invalid",moodle_token:"private",clerk_secret_key:"private",password:"private"}));
 assert.deepEqual(settings,{contact_email:"hello@example.invalid",about:"Public introduction"});
 assert.deepEqual(publicCatalogueExtra("resource",JSON.stringify({url:"https://www.upsc.gov.in/",document:"private/file.pdf",credentials:{token:"secret"}})),{url:"https://www.upsc.gov.in/"});
 assert.deepEqual(publicCatalogueExtra("settings",JSON.stringify({about:{secret:"nested"}})),{});
});
