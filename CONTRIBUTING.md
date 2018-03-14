# Contributing

How to contribute to OpenHex ?


## Contribute to source code

Requires git, NodeJS >=7.6 and NPM >=5.7

``` bash
git clone git@github.com:alcalyn/openhex.git
cd openhex/

npm install
npm start
```

Then you'll be able to test the game, and develop in `src/`.

It is a ReactJS application built with `create-react-app`.


### Testing

There is unit test for every bug encoutered until now,
or features that were tricky to test.

Unit tests are implemented with Mocha, in `test/` folder.

Running tests:

``` bash
npm test
```


### Creating an unit test

Unit tests are using a generated world with a constant seed.

So to visualize the generated world and see the hexs coords, do:

- Create a symlink to `test/` in `src/`: `cd src/ && ln -s ../test`
- Copy paste the test world in `src/App.js`, and replace the normal world:

``` js
class App extends Component {
    constructor(props, context) {
        super(props, context);

        //const world = WorldGenerator.generate();
        //const arbiter = new Arbiter(world);

        //arbiter.setCurrentPlayer(world.config.players[0]);


        const world = generateTestWorld('constant-seed-5');

        const arbiter = new Arbiter(world);
        const kingdom = world.getKingdomAt(new Hex(-3, 2, 1));
        arbiter.setCurrentPlayer(kingdom.player);
        arbiter.setCurrentKingdom(kingdom);

        world.setEntityAt(new Hex(-1, 0, 1), new Tree(Tree.COASTAL));

        // ...
```

- Don't forget to import `generateTestWorld` and missing engine classes:

``` js
import { generateTestWorld } from './test/engine/TestUtils';
import { Hex, Tree } from './engine';
```

- Then run `npm start`

You should see your testing world, and to see hex coords, open browser JS console, and click on the hex you want.


### Deploy

Deploy to `gh-pages`:

``` bash
npm run deploy
```

Then it will be available at https://alcalyn.github.io/openhex/


## Contribute to translations

OpenHex uses a self-hosted instance of [Weblate](https://weblate.tru.io/projects/openhex/) for translations.

So translating strings should not be done in the repo, *except* for English.

It uses translations key, so it is easier to translate by having an English source instead of translation key.


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

There is two separate translations folders, because there is two differents components:

- Engine

For files relative to OpenHex engine, in `src/engine/`.

Translations files are in `src/engine/locales/`

- UI

For files relative to OpenHex user interface, in `src/App.js` and `src/components/`.

Translations files are in `src/locales/`
