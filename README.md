# Demotic Packages

Repository central des packages propriétaires de la Demotic Suite, publiés sous le scope npm `@demotic/*`.

## Pourquoi ?

Les quatre outils (Clisis Coder, Mona Design, Owl WorkMate, Motion Monkey) sont des forks
rebrandés de projets open-source (OpenCode, Open Design, OpenWork, Open-Generative-AI).
Leurs packages internes (`@open-design/*`, `@openwork/*`, etc.) sont encore scopés sous le nom
de leurs projets d'origine. Ce dépôt les copie, les rebrande sous `@demotic/*` et les publie
sur npm comme packages propriétaires (BSL-1.1).

Objectif : ne plus dépendre des noms de packages des upstreams (qui peuvent disparaître,
renommer ou casser) et garder la souveraineté sur l'écosystème.

## Convention de nommage

Chaque package copié est renommé selon la convention :

```
@demotic/<outil>-<nom>
```

| Outil d'origine | Préfixe | Exemple |
|---|---|---|
| Mona Design (Open Design) | `mona` | `@demotic/mona-components` |
| Owl WorkMate (OpenWork) | `owl` | `@demotic/owl-types` |
| Motion Monkey (Open-Generative-AI) | `monkey` | `@demotic/monkey-studio` |
| Clisis Coder (OpenCode) | `clisis` | `@demotic/clisis-core` |

## Structure

```
packages/
├── mona/       # @demotic/mona-*  (ex @open-design/*)
├── owl/        # @demotic/owl-*   (ex @openwork/*, @openwork-ee/*)
├── monkey/     # @demotic/monkey-* (ex open-ai-design-agent-monorepo, open-muapi-assistant)
└── clisis/     # @demotic/clisis-* (ex @clisis-coder/*, audit)
```

## État actuel

⚠️ **Phase de préparation.** Les packages sont copiés et rebrandés, mais **aucune intégration
n'est encore faite** dans les repos producteurs (mona-design, owl-workmate, ...). Ceux-ci
continueront de consommer leurs packages internes locaux jusqu'au go-to-market, puis basculeront
sur `@demotic/*` publiés sur npm. Aucun package n'a encore été publié (pas de token npm).

## Publication

```bash
pnpm install
pnpm publish:dry-run     # vérifie sans publier
pnpm publish:packages    # publie tous les packages @demotic/* (nécessite npm login)
```

Chaque package doit avoir `"publishConfig": { "access": "public" }` et une licence BSL-1.1.

## Règles

- Ne jamais importer un package d'un repo voisin par chemin — seulement par npm (`@demotic/*`).
- Ne pas copier les apps/produits finis (desktop, web, daemon), seulement les packages réutilisables.
- Ne pas republier les dépendances tierces (react, next, ...) : elles restent sur le npm public.
- `@openclaw/*` (external_tools de clisis-coder) est un projet tiers embarqué : hors périmètre.
