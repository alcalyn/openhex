# Contributing

How to contribute to OpenHex ?


## Contribute to source code

It is a ReactJS application built with `create-react-app`.

Folders:

```
src/
    components/     # ReactJs components used for UI
        GameRules/  # Contains text and tutorials for game rules page
            locales/    # Translations for game rules
    engine/         # Model classes in raw ES6
        locales/    # Translations for OpenHex engine
    i18n/           # Base installation for translations
    locales/        # Translations for OpenHex UI
    themes/         # Contains images for themes
test/
```


### Testing

There is unit test for every bug encoutered until now,
or features that were tricky to test.

Unit tests are implemented with Mocha, in `test/` folder.

Running tests:

``` bash
npm test

# Or with Docker
make test
```


### Creating an unit test

Most unit tests use generated worlds with a constant seed.

To visualize the generated world and see the hexs coords, you can copy paste the test world in `src/App.js`, and run the application to see and play the world.


## Contribute to translations

You can translate OpenHex on this [self-hosted instance of Weblate](https://weblate.alcalyn.app/projects/openhex/).


### Adding a new translation key

If you need to add a new translated strings, just create your translation key
in source code using embedded JSON, like:

`not_enough_money.not_enough_money`

Then run:

``` bash
npm run translations-scan
```

That will scan for new translations keys and add it to translations files.

Then translate your key *at least* in English in `src/engine/locales/en.json` or `src/locales/en.json`.

There is multiple separate translations folders, one for each component:

- Engine

For files relative to OpenHex engine, in `src/engine/`.

Translations files are in `src/engine/locales/`

- UI

For files relative to OpenHex user interface, in `src/components/`.

Translations files are in `src/locales/`

- Game rules

For files relative to rules, in `src/GameRules`.

Translations files are in `src/GameRules/locales/`


### Deploy

Deploy to `gh-pages`:

``` bash
npm run deploy
```

Then it will be available at https://alcalyn.github.io/openhex/
