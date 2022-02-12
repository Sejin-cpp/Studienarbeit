import Phaser from 'phaser'
import 'regenerator-runtime/runtime'
import GaigelMode1 from './scenes/GaigelMode1'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 1920,
	height: 1200,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [GaigelMode1]
}

export default new Phaser.Game(config)
