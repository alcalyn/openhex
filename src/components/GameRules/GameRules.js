import React, { Component } from 'react';
import { I18n, Trans } from 'react-i18next';
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
            <I18n i18n={ i18nGameRules }>
                {t => (
                    <main className={'learn-to-play container'}>

                        <Trans i18nKey="e93726c4" parent={ 'h1' }>OpenHex rules</Trans>

                        <Trans i18nKey="85d12a40" parent={ 'h2' }>Objectives</Trans>

                        <ul>
                            <Trans i18nKey="28f3400b" parent={ 'li' }>
                                Conquier all the Island
                            </Trans>
                            <Trans i18nKey="e6390906" parent={ 'li' }>
                                or make your opponents surrender.
                            </Trans>
                        </ul>

                        <Trans i18nKey="da802935" parent={ 'p' }>
                            Buy units, capture hexs, defend your kingdoms,
                            upgrade your units, kill opponent units.
                        </Trans>


                        <Trans i18nKey="8a0ee290" parent={ 'h2' }>World</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ firstWorld }
                                height={ 400 }
                            />
                            <Trans i18nKey="cc57c3d7" parent={ 'figcaption' } className={'figure-caption text-center'}>World with 6 players.</Trans>
                        </figure>

                        <Trans i18nKey="35a263ae" parent={ 'p' }>
                            The world is an island on which players start
                            with many random little kingdoms composed of hexs.
                        </Trans>

                        <Trans i18nKey="d3932341" parent={ 'h2' }>Hexs</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ singleHexWorld }
                                height={ 100 }
                            />
                            <Trans i18nKey="3778d04e" parent={ 'figcaption' } className={'figure-caption text-center'}>Empty hex to the green player.</Trans>
                        </figure>

                        <Trans i18nKey="518894f9" parent={ 'p' }>
                            A "hex" is a box where an entity (an unit, a tree, a tower...)
                            can be.
                        </Trans>

                        <Trans i18nKey="405207ca" parent={ 'p' }>
                            A hex is always owned by a player, and take the player color.
                        </Trans>

                        <Trans i18nKey="36d14f9b" parent={ 'p' }>
                            If two hexs of the same player are adjacents,
                            they are linked so a new kingdom is created.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ twoHexsWorld }
                                height={ 100 }
                            />
                            <Trans i18nKey="edebb5b4" parent={ 'figcaption' } className={'figure-caption text-center'}>2-hexs kingdom with a capital.</Trans>
                        </figure>


                        <Trans i18nKey="14d64948" parent={ 'h2' }>Kingdoms</Trans>

                        <Trans i18nKey="a43c7f6c" parent={ 'p' }>
                            A kingdom is a group of at least 2 adjacent hexs.
                        </Trans>

                        <Trans i18nKey="781ff040" parent={ 'p' }>
                            Each kingdom has its own economy, one capital,
                            and earns every turn as enough money
                            as there is hexs inside.
                        </Trans>

                        <Trans i18nKey="0a0f3074" parent={ 'p' }>
                            You can select a kingdom by clicking on it.
                            Once you control a kingdom, you can:
                        </Trans>

                        <ul>
                            <li>
                                <Trans i18nKey="035c6e4b">see how much money you can spend</Trans>
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
                                ><Trans i18nKey="1c76a29a">Buy new units</Trans></button>,
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
                                ><Trans i18nKey="2aec0e42">Buy towers</Trans></button>,
                            </li>
                            <Trans i18nKey="8329d3f7" parent={ 'li' }>play units in this kingdom.</Trans>
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
                                <Trans i18nKey="7a9ed2b5">Select your green kingdoms and buy what you want.</Trans>
                                { null === this.state.kingdomsError ? '' : (
                                    <Trans i18nKey="e272210b" parent={ 'p'} className={'text-danger'}><br/>{ this.state.kingdomsError }</Trans>
                                ) }
                            </figcaption>
                        </figure>

                        <Trans i18nKey="b1396a49" parent={ 'p' }>
                            You need to capture hexs to make your kingdoms grow.
                            More they grow, more money you win every turn,
                            more units you can afford.
                        </Trans>

                        <Trans i18nKey="3b56080f" parent={ 'p' }>
                            You also have to defend your kingdoms to prevent
                            ennemy to encroach them.
                        </Trans>

                        <Trans i18nKey="5f6fde29" parent={ 'h3' }>Kingdom capital</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ capitalWorld }
                                height={ 100 }
                            />
                            <Trans i18nKey="472d55d9" parent={ 'figcaption' } className={'figure-caption text-center'}>The capital.</Trans>
                        </figure>

                        <Trans i18nKey="8212bf6f" parent={ 'p' }>
                            Your capital stores your kingdom money,
                            and provides a protection to adjacents hexs.
                        </Trans>

                        <Trans i18nKey="5dae4c94" parent={ 'p' }>
                            If the ennemy destroy your capital, you lose
                            your money and your capital is rebuilt
                            somewhere else in the kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ defendingCapitalWorld }
                                height={ 150 }
                            />
                            <Trans i18nKey="9d73e33f" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Capital defending his hexs and all adjacents with level 1.
                            </Trans>
                        </figure>

                        <Trans i18nKey="ea7d19f0" parent={ 'h3' }>Linking and cutting kingdoms</Trans>

                        <Trans i18nKey="c6b876b1" parent={ 'p' }>
                            If you capture an hex that make two of your kingdoms
                            now adjacents, then these two kingdoms are merged
                            to a single one more stronger.
                        </Trans>

                        <Trans i18nKey="555e62d6" parent={ 'p' }>
                            The economy is merged, the capital of the weakest
                            kingdom is transfered to the strongest one.
                        </Trans>

                        <Trans i18nKey="dceb13d4" parent={ 'p' }>
                            Also, if a kingdom is cut by an unit, the economy
                            is split depending on the size of the splitted kingdoms.
                        </Trans>

                        <Trans i18nKey="8fb157ce" parent={ 'p' }>
                            This is a key of the game: try to merge your kingdoms
                            to a stronger one, and cut your opponent kingdoms to divide
                            his forces.
                        </Trans>

                        <Trans i18nKey="f37d6f44" parent={ 'h3' }>Kingdom bankrupt</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ deadWorld }
                                height={ 150 }
                            />
                            <Trans i18nKey="b6272d84" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                If you don't have enough money to pay units maintenance, they all die !
                            </Trans>
                        </figure>

                        <Trans i18nKey="22bfe358" parent={ 'p' }>
                            On the beginning of a turn, your kingdoms earn one gold
                            for each hexs it owns. Then, you pay your units maintenance.
                        </Trans>

                        <Trans i18nKey="6bb71e3c" parent={ 'p' }>
                            At this moment, if you don't have enough money to pay them,
                            your kingdom falls into bankruptcy.
                        </Trans>

                        <Trans i18nKey="70c73140" parent={ 'p' }>
                            All your units of the kingdom die !
                            And the economy is reset to zero.
                        </Trans>

                        <Trans i18nKey="f15c9e64" parent={ 'p' }>
                            You just have to wait to the next turn to earn money.
                            But you still can play your other kingdoms:
                            bankruptcy does not apply to all kingdoms.
                        </Trans>


                        <Trans i18nKey="ae5fb726" parent={ 'h2' }>Units</Trans>

                        <figure className={'figure d-block has-move'}>
                            <OpenHexGrid
                                world={ unitsWorld }
                                height={ 100 }
                            />
                            <Trans i18nKey="3ad18d35" parent={ 'figcaption' } className={'figure-caption text-center'}>Units from level 1 to level 4.</Trans>
                        </figure>

                        <Trans i18nKey="9c153e5f" parent={ 'p' }>
                            Units are needed to:
                        </Trans>

                        <ul>
                            <Trans i18nKey="20b8c005" parent={ 'li' }>capture hexs, and make your kingdom grow,</Trans>
                            <Trans i18nKey="e6078cc1" parent={ 'li' }>kill ennemy units and structures (capitals, towers)</Trans>
                        </ul>

                        <Trans i18nKey="68c1d86d" parent={ 'h3' }>Getting new units</Trans>

                        <Trans i18nKey="9055dff9" parent={ 'p' }>
                            You can buy unit in a kingdom.
                        </Trans>

                        <Trans i18nKey="295a83a3" parent={ 'p' }>
                            An unit always costs 10 gold.
                        </Trans>

                        <Trans i18nKey="7c836bf2" parent={ 'p' }>
                            An unit belongs to its kingdom,
                            it cannot transfered to another kingdom,
                            and it cannot be sold.
                        </Trans>

                        <Trans i18nKey="3e512256" parent={ 'p' }>
                            An unit also has a maintenance cost every turn,
                            so keep an eye on your kingdom balance.
                        </Trans>

                        <Trans i18nKey="d963ffa7" parent={ 'h3' }>Moving your units</Trans>

                        <Trans i18nKey="f94c8758" parent={ 'p' }>
                            Each unit can move anywhere inside his kingdom.
                            But an unit can do only one action per turn.
                        </Trans>

                        <Trans i18nKey="4918d994" parent={ 'p' }>
                            To move an unit, click on it, then the unit is put
                            in your selection.
                            Then click on the hex you want to put the unit.
                        </Trans>

                        <Trans i18nKey="d589af87" parent={ 'p' }>
                            An action is:
                        </Trans>

                        <ul>
                            <Trans i18nKey="648ef7d9" parent={ 'li' }>capturing an adjacent hex,</Trans>
                            <Trans i18nKey="739b4747" parent={ 'li' }>killing an ennemy entity,</Trans>
                            <Trans i18nKey="5a336d39" parent={ 'li' }>cut a tree.</Trans>
                        </ul>

                        <Trans i18nKey="15da6edb" parent={ 'p' }>
                            Once an unit made his action, it cannot be moved anymore,
                            stops bouncing, and stays on the hex until the next turn.
                        </Trans>

                        <Trans i18nKey="23776b93" parent={ 'p' }>
                            Moving only inside kingdom is not considered as an action,
                            so you can move it until the unit make an action.
                        </Trans>

                        <Trans i18nKey="587fad8a" parent={ 'h3' }>Capturing hexs</Trans>

                        <Trans i18nKey="254a332e" parent={ 'p' }>
                            You have to capture all hexs of the world to win,
                            however your opponents should surrender before.
                        </Trans>

                        <Trans i18nKey="c78e9e92" parent={ 'p' }>
                            To capture a hex, you have to capture hexs adjacents to your kingdom.
                            Then, the captured hex now belongs to your kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ captureWorld }
                                arbiter={ captureArbiter }
                                height={ 400 }
                            />
                            <Trans i18nKey="544ccb69" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Capture unprotected adjacents hexs.
                                <br/>
                                Bonus: try to link your kingdoms together.
                            </Trans>
                        </figure>

                        <Trans i18nKey="0b4e72b6" parent={ 'p' }>
                            Each hex generates 1 gold to your kingdom each turn.
                        </Trans>

                        <Trans i18nKey="610e7d84" parent={ 'h3' }>Unit fight</Trans>

                        <Trans i18nKey="6d6675fe" parent={ 'p' }>
                            Your unit defends its own hexs, and all the adjacent ones.
                        </Trans>

                        <Trans i18nKey="11202cff" parent={ 'p' }>
                            It defends them at the same level as the unit level, and only
                            hexs in unit kingdom.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ defendingUnitWorld }
                                height={ 150 }
                            />
                            <Trans i18nKey="175d251c" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                This level 1 unit defend all adjacent hexs at level 1.
                                So only level 2 enemy units can capture them and kill your unit.
                            </Trans>
                        </figure>

                        <Trans i18nKey="ff302c79" parent={ 'p' }>
                            You can kill enemy units by placing your unit on the enemy unit.
                            It is possible if:
                        </Trans>

                        <ul>
                            <Trans i18nKey="39d622a8" parent={ 'li' }>your unit has a higher level than the enemy unit,</Trans>
                            <Trans i18nKey="2d7016ce" parent={ 'li' }>the enemy unit is on an hex adjacent to your kingdom,</Trans>
                            <Trans i18nKey="a73d0b4f" parent={ 'li' }>the enemy unit is not defended (i.e on adjacent hex) by an higher level unit or tower.</Trans>
                        </ul>

                        <figure className={'figure d-block text-center'}>
                            <img
                                src={ imgFight }
                                alt={ 'units attack'}
                                className={'img-fluid'}
                            />
                            <Trans i18nKey="5e431231" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                You can kill units and/or capture hexs less protected than you unit level.
                                Note that a capital is like a level 1 unit.
                            </Trans>
                        </figure>

                        <Trans i18nKey="140c3f85" parent={ 'p' }>
                            At the end of the turn, keep an eye on the hexs you are defending
                            with your units placement. You may want to defend your frontiers.
                        </Trans>

                        <figure className={'figure d-block text-center'}>
                            <img
                                src={ imgProtect }
                                alt={ 'units protecting'}
                                className={'img-fluid'}
                            />
                            <Trans i18nKey="2307b755" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Units level 1 and 2 here do their best defending frontiers,
                                but be careful of your critical points, where enemy
                                can easily cut your kingdom.
                            </Trans>
                        </figure>

                        <Trans i18nKey="415f2d67" parent={ 'h3' }>Upgrading units</Trans>

                        <Trans i18nKey="3cc5f2f8" parent={ 'p' }>
                            Level 1 units are good to provide a low cost,
                            wide and basic kingdom protection.
                        </Trans>

                        <Trans i18nKey="bd88b087" parent={ 'p' }>
                            But as the enemy build units, you have to upgrade your units
                            in order to kill them, and defend your kingdom from stronger enemy.
                        </Trans>

                        <Trans i18nKey="7dac20a0" parent={ 'p' }>
                            To upgrade an unit, just merge two units together by placing an unit on another.
                            It creates a single stronger unit, and can beat stronger enemy units and structures.
                        </Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ upgradeWorld }
                                arbiter={ new Arbiter(upgradeWorld) }
                                height={ 150 }
                            />
                            <Trans i18nKey="d295cb13" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Upgrade units by taking one and placing it on another.
                            </Trans>
                        </figure>

                        <Trans i18nKey="2db46e2d" parent={ 'p' }>
                            The new created unit can do an action only
                            if you merged two units that could do an action
                            (so try to merge two units that aren't already do they actions).
                        </Trans>

                        <Trans i18nKey="ebf87648" parent={ 'p' }>
                            You can also upgrade an unit by selecting it, and buy an unit.
                            It will simply upgrade the selected unit.
                        </Trans>

                        <Trans i18nKey="5b0af934" parent={ 'h3' }>Units costs and maintenance</Trans>

                        <Trans i18nKey="0a31ee19" parent={ 'p' }>
                            Each unit costs 10 gold to buy, and costs 10 gold to upgrade.
                        </Trans>

                        <Trans i18nKey="f03b7068" parent={ 'p' }>
                            A level 1 unit costs 2 gold every turn to maintain.
                        </Trans>

                        <Trans i18nKey="765a9ba0" parent={ 'p' }>
                            And the maintenance cost is 3 times expensive each level the unit upgrades.
                        </Trans>

                        <Trans i18nKey="fc6f6b40" parent={ 'p' }>
                            Units maintenance costs:
                        </Trans>

                        <ul className={'maintenance-list'}>
                            <li><img src={Themes.getImageFor(new Unit(1))} alt="unit level 1" />: 2 <img src={Themes.getImageForMoney(2)} alt="gold" /></li>
                            <li><img src={Themes.getImageFor(new Unit(2))} alt="unit level 2" />: 6 <img src={Themes.getImageForMoney(6)} alt="gold" /></li>
                            <li><img src={Themes.getImageFor(new Unit(3))} alt="unit level 3" />: 18 <img src={Themes.getImageForMoney(18)} alt="gold" /></li>
                            <li><img src={Themes.getImageFor(new Unit(4))} alt="unit level 4" />: 54 <img src={Themes.getImageForMoney(54)} alt="gold" /></li>
                        </ul>

                        <Trans i18nKey="d46f26ee" parent={ 'p' }>
                            So upgraded units need more and more space,
                            so upgrade only as your kingdom grow.
                        </Trans>


                        <Trans i18nKey="45263efe" parent={ 'h2' }>Towers</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ defendingTowerWorld }
                                height={ 150 }
                            />
                            <Trans i18nKey="74e45681" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                Tower defending his hexs and all adjacents with level 2.
                            </Trans>
                        </figure>

                        <Trans i18nKey="1ed51852" parent={ 'p' }>
                            Towers are used to defend your kingdom:
                        </Trans>

                        <ul>
                            <Trans i18nKey="a8b47d14" parent={ 'li' }>it costs 15 gold,</Trans>
                            <Trans i18nKey="34de74de" parent={ 'li' }>it has not maintenance costs,</Trans>
                            <Trans i18nKey="7efdb7a3" parent={ 'li' }>it defend from level 2 units,</Trans>
                            <Trans i18nKey="7e942a8c" parent={ 'li' }>and can be destroyed by a level 3 unit.</Trans>
                        </ul>


                        <Trans i18nKey="e94f7d5d" parent={ 'h2' }>Trees</Trans>

                        <figure className={'figure d-block'}>
                            <OpenHexGrid
                                world={ treeWorld }
                                height={ 100 }
                            />
                            <Trans i18nKey="e4ad887b" parent={ 'figcaption' } className={'figure-caption text-center'}>
                                A Tree.
                            </Trans>
                        </figure>

                        <Trans i18nKey="c1a70bc6" parent={ 'p' }>
                            If a tree is on a hex of your kingdom,
                            it prevents the hex to generate gold,
                            so you should cut them.
                        </Trans>

                        <Trans i18nKey="cc78afc4" parent={ 'p' }>
                            You can cut a tree with any unit.
                            It counts as an action,
                            so your unit can cut only one tree per turn.
                        </Trans>

                        <Trans i18nKey="6bce8d76" parent={ 'p' }>
                            Trees appears only:
                        </Trans>

                        <ul>
                            <Trans i18nKey="2d17c42c" parent={ 'li' }>at the beginning of the game,</Trans>
                            <Trans i18nKey="ba495e21" parent={ 'li' }>on the hexs where an unit has died from bankruptcy.</Trans>
                        </ul>

                        <Trans i18nKey="ad4abb1c" parent={ 'p' }>
                            And most importantly, trees multiply over time:
                            new trees spawns on hexs adjacent to other trees.
                        </Trans>

                        <Trans i18nKey="e7fb804e" parent={ 'p' }>
                            More the game lasts, more they spawns quickly.
                            So try to keep them under control.
                        </Trans>

                        <Trans i18nKey="d2373207" parent={ 'p' }>
                            There is two types of trees.
                            The coastal trees and the continental trees.
                        </Trans>

                        <Trans i18nKey="2e7af2eb" parent={ 'p' }>
                            Coastal trees grows only on world borders.
                            But they grow more quickly.
                        </Trans>

                        <Trans i18nKey="d6cb2d37" parent={ 'p' }>
                            Continental trees grow only inside world, but more slowly.
                        </Trans>

                        <Trans i18nKey="3489fa9b" parent={ 'h2' }>Strategy tips</Trans>

                        <Trans i18nKey="47225f64" parent={ 'p' }>
                            Upgraded units costs a lot of money each turns,
                            so you should always upgrade your level 1 unit
                            only if you already have a few other level 1 units,
                            or you are at least 6 hexs in your kingdom.
                        </Trans>

                        <Trans i18nKey="d00bb9eb" parent={ 'p' }>
                            And upgrading your level 2 unit to level 3
                            is rare, do it only if you already have
                            many level 2 units and a consequent kingdom,
                            or if opponent has built many towers.
                        </Trans>

                        <Trans i18nKey="d6880702" parent={ 'p' }>
                            Level 4 units is for very late games,
                            when you have almost all the world,
                            but you need to kill a level 3 opponent unit.
                        </Trans>

                        <Trans i18nKey="21c72058" parent={ 'p' }>
                            Usually, it is easiest to kill level 3 or level 4 opponent units
                            by cutting his territory and reduce opponent kingdom income.
                        </Trans>

                    </main>
                )}
            </I18n>
        );
    }
}
