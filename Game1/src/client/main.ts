import Phaser from 'phaser'
import 'regenerator-runtime/runtime'
import GaigelMode1v1 from './scenes/GaigelMode1v1'
import GaigelMode2v2 from './scenes/GaigelMode2v2'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1920,
	height: 1200,
	scale: {
		mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT ,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [GaigelMode1v1]
}

export default new Phaser.Game(config)
