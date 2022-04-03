import Phaser from 'phaser'
import 'regenerator-runtime/runtime'
import LobbyMode1 from './scenes/LobbyMode1'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 0,
	height: 0,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 }
		}
	},
	scene: [LobbyMode1]
}

export default new Phaser.Game(config)