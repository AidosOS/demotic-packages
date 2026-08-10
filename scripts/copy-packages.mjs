#!/usr/bin/env node
/**
 * copy-packages.mjs
 *
 * Copie des packages depuis les repos des forks vers demotic-packages/
 * et rebrand les références internes (imports, deps, tsconfig paths).
 *
 * Usage:
 *   node scripts/copy-packages.mjs <repo> <sourceDir> <destBase> <pkgListJson>
 *
 * Chaque entrée de pkgListJson:
 *   { "src": "packages/components", "name": "@demotic/mona-components" }
 *
 * La copie exclut node_modules, dist, build, .turbo, coverage, .git.
 * Les imports internes de l'ancien scope sont réécrits via oldToNew.
 */

import { cpSync, existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs"
import { join, resolve } from "node:path"

const [, , repo, sourceDir, destBase, pkgListJson, oldScope, newScope, catalogJson] = process.argv

if (!repo || !sourceDir || !destBase || !pkgListJson) {
  console.error("Usage: node scripts/copy-packages.mjs <repo> <sourceDir> <destBase> <pkgListJson> [oldScope] [newScope] [catalogJson]")
  process.exit(1)
}

const ROOT = resolve(import.meta.dirname, "..")
const SOURCE = resolve(ROOT, "..", repo, sourceDir)
const DEST = resolve(ROOT, destBase)
const entries = JSON.parse(readFileSync(pkgListJson, "utf8"))

const catalog = {}
if (catalogJson) {
  const catPath = resolve(ROOT, "..", repo, catalogJson)
  if (existsSync(catPath)) {
    const raw = readFileSync(catPath, "utf8").replace(/^\uFEFF/, "")
    const cat = JSON.parse(raw).workspaces?.catalog ?? {}
    for (const [k, v] of Object.entries(cat)) catalog[k] = v
    console.log(`   catalog: ${Object.keys(catalog).length} entrées depuis ${catPath}\n`)
  } else {
    console.warn(`   !! catalogue introuvable: ${catPath}\n`)
  }
}

function resolveCatalog(depKey, deps) {
  const next = {}
  for (const [k, v] of Object.entries(deps)) {
    next[k] = v === "catalog:" && catalog[k] ? catalog[k] : v
  }
  return next
}

const EXCLUDED = /(node_modules|\.git|dist|build|\.turbo|coverage|\.next|out|release|storybook-static)$/

function rewriteInFile(file, oldToNew) {
  if (!existsSync(file)) return
  const raw = readFileSync(file, "utf8")
  let out = raw
  for (const [from, to] of oldToNew) {
    out = out.split(from).join(to)
  }
  if (out !== raw) writeFileSync(file, out, "utf8")
}

function copyTree(src, dest, oldToNew) {
  if (!existsSync(src)) {
    console.warn(`  !! absent: ${src}`)
    return
  }
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })

  const entries = []
  const stack = [src]
  while (stack.length) {
    const cur = stack.pop()
    for (const ent of readdirSyncFull(cur)) {
      const full = join(cur, ent.name)
      if (EXCLUDED.test(ent.name)) continue
      const rel = full.slice(src.length).replace(/\\/g, "/")
      if (ent.isDirectory()) {
        stack.push(full)
      } else {
        entries.push({ full, rel })
      }
    }
  }

  for (const { full, rel } of entries) {
    const destFile = join(dest, rel)
    mkdirSync(join(dest, rel.split("/").slice(0, -1).join("/")), { recursive: true })
    const ext = rel.split(".").pop() || ""
    if (/^(json|ts|tsx|js|mjs|cjs|jsx|md|mdx|yml|yaml|html|css|sh|toml|hbs|txt|proto|sql|graphql)$/i.test(ext)) {
      const raw = readFileSync(full, "utf8")
      let out = raw
      for (const [from, to] of oldToNew) {
        out = out.split(from).join(to)
      }
      writeFileSync(destFile, out, "utf8")
    } else {
      cpSync(full, destFile)
    }
  }
}

import { readdirSync } from "node:fs"
function readdirSyncFull(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
  } catch {
    return []
  }
}

console.log(`\n== ${repo} (${entries.length} packages) ==`)
console.log(`   source: ${SOURCE}`)
console.log(`   dest:   ${DEST}`)
console.log(`   scope:  ${oldScope ?? "-"} -> ${newScope ?? "-"}\n`)

const oldToNew = []
if (oldScope && newScope) oldToNew.push([oldScope, newScope])

for (const entry of entries) {
  const folder = entry.name
  const pkgName = entry.pkg ?? `@demotic/${folder}`
  const srcPath = join(SOURCE, entry.src)
  const destPath = join(DEST, folder)
  console.log(`[${pkgName}]`)
  copyTree(srcPath, destPath, oldToNew)

  const pkgJson = join(destPath, "package.json")
  if (existsSync(pkgJson)) {
    let rawPkg = readFileSync(pkgJson, "utf8").replace(/^\uFEFF/, "")
    const j = JSON.parse(rawPkg)
    const oldName = j.name
    j.name = pkgName
    j.private = false
    j.publishConfig = { access: "public", registry: "https://registry.npmjs.org" }
    if (!j.repository) {
      j.repository = {
        type: "git",
        url: "https://github.com/AidosOS/demotic-packages.git",
        directory: folder
      }
    }
    j.homepage = "https://github.com/AidosOS/demotic-packages"
    j.author = "Demotic Suite Contributors"
    j.license = "BSL-1.1"
    for (const depKey of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
      if (j[depKey]) {
        let deps = j[depKey]
        for (const [from, to] of oldToNew) {
          const next = {}
          for (const [k, v] of Object.entries(deps)) {
            next[k.split(from).join(to)] = v
          }
          deps = next
        }
        j[depKey] = resolveCatalog(depKey, deps)
      }
    }
    writeFileSync(pkgJson, JSON.stringify(j, null, 2) + "\n", "utf8")
    console.log(`   name: ${oldName} -> ${entry.name}`)
  }
}

console.log("\nDone.")
