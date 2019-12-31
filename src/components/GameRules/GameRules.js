import React, { Component } from 'react';
import { Translation, Trans } from 'react-i18next';
import i18nGameRules from './i18n';
import Themes from '../../themes';
import { WorldGenerator, WorldConfig, World, Hex, Player, Arbiter, Unit, Capital, Tower, Tree, Died } from '../../engine';
import { OpenHexGrid } from '../Game';
import imgFight from './images/rules-fight.png';
import imgProtect from './images/protect-hexs.png';

export default class GameRules extends Component {

    createOneHexWorld(entity = false) {
        const world = new World([
            new Hex(0, 0, 0, new Player(0)),
        ]);

        if (entity) {
            world.setEntityAt(new Hex(0, 0, 0), entity);
        }

        return world;
    }

    createDefendingWorld(player, entity = false) {
        const defendingWorldHexs = WorldGenerator.hexagon(1);
        defendingWorldHexs.push(new Hex(0, 0, 0));
        defendingWorldHexs.forEach(hex => hex.player = player);
        const defendingWorld = new World(defendingWorldHexs);
        defendingWorld.setEntityAt(new Hex(0, 0, 0), entity);

        return defendingWorld;
    }

    constructor(props, context) {
        super(props, context);

        const firstWorld = WorldGenerator.generate(null, WorldConfig({ size: 8 }));
        const player0 = new Player(0);

        const singleHexWorld = this.createOneHexWorld();

        const twoHexsWorld = new World([ new Hex(0, 0, 0, player0), new Hex(1, 0, -1, player0) ]);
        WorldGenerator.initKingdoms(twoHexsWorld);
        WorldGenerator.createCapitals(twoHexsWorld);

        const kingdomsWorld = WorldGenerator.generate('seed-11', WorldConfig({ size: 5 }));
        const kingdomsArbiter = new Arbiter(kingdomsWorld);
        kingdomsWorld.setEntityAt(new Hex(0, 2, -2), new Unit());
        kingdomsWorld.kingdoms.forEach(kingdom => kingdom.money *= 3);

        const capitalWorld = this.createOneHexWorld(new Capital());

        const unitsWorldHexs = [
            new Hex(0, 0, 0, player0),
            new Hex(1, 0, -1, player0),
            new Hex(2, -1, -1, player0),
            new Hex(3, -1, -2, player0),
        ];
        const unitsWorld = new World(unitsWorldHexs);
        [1, 2, 3, 4].forEach((level) => {
            const unit = new Unit(level);
            unit.played = false;
            unitsWorld.setEntityAt(unitsWorldHexs[level - 1], unit);
        });

        const captureWorld = WorldGenerator.generate('seed-12', WorldConfig({ size: 5 }));
        const captureArbiter = new Arbiter(captureWorld);
        captureArbiter.setCurrentKingdom(captureWorld.getKingdomAt(new Hex(2, -2, 0)));
        captureArbiter.selection = new Unit(4);
        captureArbiter.placeAt(new Hex(3, -2, -1));
        captureArbiter.selection = new Unit(4);
        captureArbiter.placeAt(new Hex(4, -3, -1));
        captureWorld.removeUnitAt(new Hex(3, -2, -1));
        captureWorld.removeUnitAt(new Hex(4, -3, -1));
        captureWorld.setEntityAt(new Hex(4, -3, -1), new Unit(1));
        captureWorld.setEntityAt(new Hex(3, -2, -1), new Unit(2));
        captureWorld.setEntityAt(new Hex(6, -5, -1), new Unit(1));
        captureWorld.setEntityAt(new Hex(1, -1, 0), new Unit(1));
        captureWorld.setEntityAt(new Hex(0, 2, -2), new Unit(1));

        const upgradeWorldHexs = [
            new Hex(0, 0, 0, player0),
            new Hex(1, -1, 0, player0),
            new Hex(1, 0, -1, player0),
            new Hex(2, -1, -1, player0),
            new Hex(3, -2, -1, player0),
            new Hex(3, -1, -2, player0),
        ];
        const upgradeWorld = new World(upgradeWorldHexs, WorldConfig({ players: [player0] }));
        WorldGenerator.initKingdoms(upgradeWorld);
        upgradeWorldHexs.forEach(hex => upgradeWorld.setEntityAt(hex, new Unit(1)));

        const treeWorld = this.createOneHexWorld(new Tree());

        const deadWorldHexs = [
            new Hex(0, 0, 0, player0),
            new Hex(1, -1, 0, player0),
            new Hex(1, 0, -1, player0),
            new Hex(2, -1, -1, player0),
            new Hex(3, -2, -1, player0),
            new Hex(3, -1, -2, player0),
        ];
        const deadWorld = new World(deadWorldHexs);
        WorldGenerator.initKingdoms(deadWorld);
        WorldGenerator.createCapitals(deadWorld);
        deadWorld.setEntityAt(new Hex(0, 0, 0), new Died());
        deadWorld.setEntityAt(new Hex(1, -1, 0), new Died());
        deadWorld.setEntityAt(new Hex(3, -1, -2), new Died());


        this.state = {
            firstWorld,
            singleHexWorld,
            twoHexsWorld,
            kingdomsWorld,
            kingdomsArbiter,
            kingdomMoney: null,
            kingdomsError: null,
            capitalWorld,
            unitsWorld,
            captureWorld,
            captureArbiter,
            upgradeWorld,
            treeWorld,
            defendingUnitWorld: this.createDefendingWorld(player0, new Unit()),
            defendingTowerWorld: this.createDefendingWorld(player0, new Tower()),
            defendingCapitalWorld: this.createDefendingWorld(player0, new Capital()),
            deadWorld,
        };
    }

    render() {
        const {
            firstWorld,
            singleHexWorld,
            twoHexsWorld,
            kingdomsWorld,
            kingdomsArbiter,
            kingdomMoney,
            capitalWorld,
            unitsWorld,
            captureWorld,
            captureArbiter,
            upgradeWorld,
            treeWorld,
            defendingUnitWorld,
            defendingTowerWorld,
            defendingCapitalWorld,
            deadWorld,
        } = this.state;

        return (
            <Translation i18n={ i18nGameRules }>
                {t => (
                    <main className={'learn-to-play container'}>

                        <Trans parent={ 'h1' }>OpenHex rules</Trans>

                        <Trans parent={ 'h2' }>Objectives</Trans>

                        <ul>
                            <Trans parent={ 'li' }>
                                Conquer the entire Island
                            </Trans>
                            <Trans parent={ 'li' }>
                                or make your opponents surrender.
                            </Trans>
                        </ul>

                        <Trans parent={ 'p' }>
                            Buy units, capture hexes, defend your kingdoms,
                            upgrade your units and kill enemy units.
                        </Trans>


                        <Trans parent={ 'h2' }>World</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ firstWorld }
                                height={ 400 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>World with six players.</Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            The world is an island on which players start with
                            many small random kingdoms composed of hexes.
                        </Trans>

                        <Trans parent={ 'h2' }>Hexes</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ singleHexWorld }
                                height={ 100 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>An empty hex that belongs to the green player.</Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            A “hex” is a box where an entity (a unit, a tree, a
                            tower …) can be.
                        </Trans>

                        <Trans parent={ 'p' }>
                            A hex is always owned by a player, and take the
                            player's color.
                        </Trans>

                        <Trans parent={ 'p' }>
                            If two hexes of the same color are adjacents, they
                            are merged to form a new kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ twoHexsWorld }
                                height={ 100 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>A two-hex kingdom with a capital.</Trans>
                        </figure>


                        <Trans parent={ 'h2' }>Kingdoms</Trans>

                        <Trans parent={ 'p' }>
                            A kingdom is a group of at least two adjacent hexes.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Each kingdom has its own economy, a capital, and
                            every turn, it earns as much money as there are
                            hexes inside.
                        </Trans>

                        <Trans parent={ 'p' }>
                            You can select a kingdom by clicking on it. Once
                            you control a kingdom, you can:
                        </Trans>

                        <ul>
                            <li>
                                <Trans>see how much money you can spend</Trans>
                                { null === kingdomMoney ? '' : (
                                    <span> ({ kingdomMoney }
                                        <img
                                            src={Themes.getImageForMoney(kingdomMoney)}
                                            className="d-none d-sm-inline"
                                            alt="gold"
                                        />
                                    )</span>
                                ) },
                            </li>
                            <li>
                                <button
                                    className={'btn btn-success space-after'}
                                    onClick={() => {
                                        try {
                                            kingdomsArbiter.buyUnit();
                                            this.setState({ kingdomMoney: kingdomsArbiter.currentKingdom.money });
                                        } catch (e) {
                                            this.setState({ kingdomsError: e.message });
                                        }
                                    }}
                                ><Trans>Buy new units</Trans></button>,
                            </li>
                            <li>
                                <button
                                    className={'btn btn-success'}
                                    onClick={() => {
                                        try {
                                            kingdomsArbiter.buyTower();
                                            this.setState({ kingdomMoney: kingdomsArbiter.currentKingdom.money });
                                        } catch (e) {
                                            this.setState({ kingdomsError: e.message });
                                        }
                                    }}
                                ><Trans>Buy towers</Trans></button>,
                            </li>
                            <Trans parent={ 'li' }>move units in this kingdom.</Trans>
                        </ul>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ kingdomsWorld }
                                arbiter={ kingdomsArbiter }
                                height={ 250 }
                                onArbiterError={ e => this.setState({ kingdomsError: e.message }) }
                                onArbiterUpdate={ () => {
                                    if (kingdomsArbiter.currentKingdom) {
                                        this.setState({
                                            kingdomMoney: kingdomsArbiter.currentKingdom.money,
                                        });
                                    }
                                } }
                            />
                            <figcaption parent={ 'figcaption' } className={'figure-caption text-center'}>
                                <Trans>Select your green kingdoms and buy what you want.</Trans>
                                { null === this.state.kingdomsError ? '' : (
                                    <Trans parent={ 'p'} className={'text-danger'}><br/>{ this.state.kingdomsError }</Trans>
                                ) }
                            </figcaption>
                        </figure>

                        <Trans parent={ 'p' }>
                            You need to capture hexes to make your kingdoms
                            grow. The more they grow, the more money you earn
                            per turn and the more units you can afford.
                        </Trans>

                        <Trans parent={ 'p' }>
                            You also have to defend your kingdoms to prevent
                            your enemies encroaching them.
                        </Trans>

                        <Trans parent={ 'h3' }>Kingdom capital</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ capitalWorld }
                                height={ 100 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>The capital.</Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            Your capital stores your kingdom's money and
                            provides protection for adjacents hexes.
                        </Trans>

                        <Trans parent={ 'p' }>
                            If the enemy destroy your capital, you lose your
                            money and your capital is rebuilt somewhere else in
                            the kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ defendingCapitalWorld }
                                height={ 150 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Capital defending its hex and all adjacents
                                with level 1.
                            </Trans>
                        </figure>

                        <Trans parent={ 'h3' }>Linking and cutting kingdoms</Trans>

                        <Trans parent={ 'p' }>
                            If you by capturing a hex make two of your kingdoms
                            share a border, they will merge to form a single
                            stronger one.
                        </Trans>

                        <Trans parent={ 'p' }>
                            The economies are merged and the capital of the
                            weakest kingdom will transfer to the stronger one.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Also, if a kingdom is cut by a unit, the economy is
                            split depending on the size of the split up
                            kingdoms.
                        </Trans>

                        <Trans parent={ 'p' }>
                            This is a key to the game: try to merge your
                            kingdoms to stronger ones and cut your opponent
                            kingdoms to divide his forces.
                        </Trans>

                        <Trans parent={ 'h3' }>Kingdom bankrupt</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ deadWorld }
                                height={ 150 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                If you don't have enough money to pay
                                maintenance for your units, they'll all die!
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            At the beginning of a turn, your kingdoms earn one
                            gold for each hex it owns. Then you pay your unit
                            maintenance.
                        </Trans>

                        <Trans parent={ 'p' }>
                            If you then don't have enough money to pay them,
                            your kingdom falls into bankruptcy.
                        </Trans>

                        <Trans parent={ 'p' }>
                            All units of your kingdom die and the economy is
                            reset to zero.
                        </Trans>

                        <Trans parent={ 'p' }>
                            You have to wait for the next turn to earn money,
                            but you can still play your other kingdoms: the
                            bankruptcy affects only one kingdoms.
                        </Trans>


                        <Trans parent={ 'h2' }>Units</Trans>

                        <figure className={'figure d-block has-move'}>
                            <OpenHexGrid
                                world={ unitsWorld }
                                height={ 100 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>Units from level 1 to level 4.</Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            Units are needed to:
                        </Trans>

                        <ul>
                            <Trans parent={ 'li' }>capture hexes and make your kingdom grow,</Trans>
                            <Trans parent={ 'li' }>kill enemy units and structures (capitals, towers)</Trans>
                        </ul>

                        <Trans parent={ 'h3' }>Getting new units</Trans>

                        <Trans parent={ 'p' }>
                            You can buy units in a kingdom.
                        </Trans>

                        <Trans parent={ 'p' }>
                            A unit always costs 10 gold.
                        </Trans>

                        <Trans parent={ 'p' }>
                            A unit belongs to its kingdom, cannot be transfered
                            to another kingdom and can not be sold.
                        </Trans>

                        <Trans parent={ 'p' }>
                            A unit also has a maintenance cost every turn, so
                            keep an eye on your kingdom's balance.
                        </Trans>

                        <Trans parent={ 'h3' }>Moving your units</Trans>

                        <Trans parent={ 'p' }>
                            Each unit can move freely inside its kingdom. But a
                            unit can only do one action per turn.
                        </Trans>

                        <Trans parent={ 'p' }>
                            To move a unit, you simply click on it to select
                            it. Then you can click on the hex you want to put
                            the unit.
                        </Trans>

                        <Trans parent={ 'p' }>
                            An action is:
                        </Trans>

                        <ul>
                            <Trans parent={ 'li' }>capturing an adjacent hex,</Trans>
                            <Trans parent={ 'li' }>killing an enemy entity,</Trans>
                            <Trans parent={ 'li' }>cutting a tree.</Trans>
                        </ul>

                        <Trans parent={ 'p' }>
                            Once a unit made its action, it cannot be moved
                            anymore, stops bouncing and stays on the hex until
                            the next turn.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Moving only inside kingdom is not considered as an
                            action, so you can move it until the unit has made
                            an action.
                        </Trans>

                        <Trans parent={ 'h3' }>Capturing hexes</Trans>

                        <Trans parent={ 'p' }>
                            You have to capture all hexes of the world to win,
                            but your opponents might surrender before that.
                        </Trans>

                        <Trans parent={ 'p' }>
                            You can only capture hexes adjacents to your
                            kingdom. The captured hex will become part of your
                            kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ captureWorld }
                                arbiter={ captureArbiter }
                                height={ 400 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Capture unprotected adjacents hexes.
                                <br/>
                                Bonus: try linking your kingdoms together.
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            Each hex generates 1 gold to your kingdom per turn.
                        </Trans>

                        <Trans parent={ 'h3' }>Unit fight</Trans>

                        <Trans parent={ 'p' }>
                            Your unit defends its own hex and all the adjacent
                            ones.
                        </Trans>

                        <Trans parent={ 'p' }>
                            It defends them at the same level as the unit's
                            level, and only hexes in its own kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ defendingUnitWorld }
                                height={ 150 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                This level 1 unit defend all adjacent hexes at
                                level 1. Only level 2 enemy units can capture
                                them and kill your unit.
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            You can kill enemy units by placing your units on
                            the enemy. It is possible if:
                        </Trans>

                        <ul>
                            <Trans parent={ 'li' }>your unit has a higher level than the enemy unit,</Trans>
                            <Trans parent={ 'li' }>the enemy unit is on a hex adjacent to your kingdom</Trans>
                            <Trans parent={ 'li' }>and the enemy unit is not defended by a higher level unit or tower.</Trans>
                        </ul>

                        <figure className={'figure d-block text-center'}>
                            <img
                                src={ imgFight }
                                alt={ 'units attack'}
                                className={'img-fluid'}
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                You can kill units and capture hexes less
                                protected than your unit's level. Note that a
                                capital is treated like a level 1 unit.
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            Keep an eye on the hexes you are defending with
                            your unit placement at the end of the turn. You may
                            want to defend your frontiers.
                        </Trans>

                        <figure className={'figure d-block text-center'}>
                            <img
                                src={ imgProtect }
                                alt={ 'units protecting'}
                                className={'img-fluid'}
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Units level 1 and 2 here do their best
                                defending frontiers, but be aware of your
                                critical points, where enemy can divide your
                                kingdom easily.
                            </Trans>
                        </figure>

                        <Trans parent={ 'h3' }>Upgrading units</Trans>

                        <Trans parent={ 'p' }>
                            Level 1 units are good to provide a low cost, wide
                            and basic kingdom protection.
                        </Trans>

                        <Trans parent={ 'p' }>
                            But as the enemy build units, you have to upgrade
                            your units to be able to defend your kingdom from a
                            stronger enemy.
                        </Trans>

                        <Trans parent={ 'p' }>
                            To upgrade a unit, you simply merge two units
                            together by placing one unit on another. This
                            creates a single stronger unit that can beat
                            stronger enemy units and structures.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ upgradeWorld }
                                arbiter={ new Arbiter(upgradeWorld) }
                                height={ 150 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Upgrade units by taking one and placing it on
                                another.
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            The newly created unit can only make an action if
                            you merged two units that could make an action (so
                            try to merge two units that haven't already made
                            their actions).
                        </Trans>

                        <Trans parent={ 'p' }>
                            You can also upgrade a unit by selecting it and buy
                            a new unit. This will simply upgrade the selected
                            unit.
                        </Trans>

                        <Trans parent={ 'h3' }>Unit costs and maintenance</Trans>

                        <Trans parent={ 'p' }>
                            Each unit costs 10 gold to buy and costs 10 gold to
                            upgrade.
                        </Trans>

                        <Trans parent={ 'p' }>
                            A level 1 unit costs 2 gold every turn to maintain.
                        </Trans>

                        <Trans parent={ 'p' }>
                            And the maintenance cost is tripled each level the
                            unit upgrades.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Unit maintenance costs:
                        </Trans>

                        <ul className={'maintenance-list'}>
                            <li><img src={Themes.getImageFor(new Unit(1))} alt="unit level 1" />: 2 <img src={Themes.getImageForMoney(2)} alt="gold" /></li>
                            <li><img src={Themes.getImageFor(new Unit(2))} alt="unit level 2" />: 6 <img src={Themes.getImageForMoney(6)} alt="gold" /></li>
                            <li><img src={Themes.getImageFor(new Unit(3))} alt="unit level 3" />: 18 <img src={Themes.getImageForMoney(18)} alt="gold" /></li>
                            <li><img src={Themes.getImageFor(new Unit(4))} alt="unit level 4" />: 54 <img src={Themes.getImageForMoney(54)} alt="gold" /></li>
                        </ul>

                        <Trans parent={ 'p' }>
                            Upgraded units will thus need more and more
                            territory, so upgrade only as your kingdom grow.
                        </Trans>


                        <Trans parent={ 'h2' }>Towers</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ defendingTowerWorld }
                                height={ 150 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Tower defending its hex and all adjacents ones
                                with level 2.
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            Towers are used to defend your kingdom:
                        </Trans>

                        <ul>
                            <Trans parent={ 'li' }>it costs 15 gold,</Trans>
                            <Trans parent={ 'li' }>it has not maintenance cost,</Trans>
                            <Trans parent={ 'li' }>it defends from level 2 units,</Trans>
                            <Trans parent={ 'li' }>and can be destroyed by a level 3 unit.</Trans>
                        </ul>


                        <Trans parent={ 'h2' }>Trees</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ treeWorld }
                                height={ 100 }
                            />
                            <Trans parent={ 'figcaption' } className={'figure-caption text-center'}>
                                A Tree.
                            </Trans>
                        </figure>

                        <Trans parent={ 'p' }>
                            If a tree stands on a hex in your kingdom, the hex
                            will not generate any income, so you should cut
                            them.
                        </Trans>

                        <Trans parent={ 'p' }>
                            You can cut a tree with any unit. It counts as an
                            action, so your unit can only cut one tree per
                            turn.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Trees appears only:
                        </Trans>

                        <ul>
                            <Trans parent={ 'li' }>at the beginning of the game,</Trans>
                            <Trans parent={ 'li' }>on a hex where a unit has died from bankruptcy.</Trans>
                        </ul>

                        <Trans parent={ 'p' }>
                            And most importantly, trees multiply over time: new
                            trees spawns on hexes adjacent to other trees.
                        </Trans>

                        <Trans parent={ 'p' }>
                            They spawn more quickly as the game goes on, so try
                            keeping them under control.
                        </Trans>

                        <Trans parent={ 'p' }>
                            There are two types of trees: the coastal tree and
                            the continental tree.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Coastal trees grows only on world edges and they
                            spread quickly.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Continental trees grow everywhere else, but don't
                            spread as quickly.
                        </Trans>

                        <Trans parent={ 'h2' }>Strategy tips</Trans>

                        <Trans parent={ 'p' }>
                            Upgraded units costs a lot of money each turn, so
                            you should only upgrade your level 1 unit if you
                            already have a few other level 1 units or have at
                            least six hexes in your kingdom.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Upgrading your level 2 unit to level 3 is seldom
                            necessary. Do it only if you already have many
                            level 2 units and a stable kingdom, or if your
                            opponent has built many towers.
                        </Trans>

                        <Trans parent={ 'p' }>
                            Level 4 units are for very late games, when you
                            have almost conquered the entire world and need to
                            kill a level 3 opponent unit.
                        </Trans>

                        <Trans parent={ 'p' }>
                            It is usually easiest to kill level 3 or level 4
                            opponent units by cutting his territory, thus
                            reducing the opponent kingdom's income.
                        </Trans>

                    </main>
                )}
            </Translation>
        );
    }
}
