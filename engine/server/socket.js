module.exports = function(library, settings, scenes, cache, io) {

	// Перехводчик событий клиента

	io.on('connection', function(socket) {

		socket.emit('onPlayerConnect', {
			id: socket.id,
			settings: settings,
			cache: cache
		});

		var player = library._createPlayer(socket);

		library._callEvent('onPlayerConnect', player);

		socket

		.on('disconnect', function() {

			for(var i = 0; i < scenes[player.scene].list.object.length; ++i) {
				if(library.inArray(scenes[player.scene].list.object[i].data.mouse, player.id)) {

					library.deleteArrayValue(scenes[player.scene].list.object[i].data.mouse, player.id);

					library._callEvent('onObjectMouseLeave', scenes[player.scene].list.object[i], [ 
						player
					]);

				}
			}

			for(var i = 0; i < scenes[player.scene].list.hud.length; ++i) {
				if(library.inArray(scenes[player.scene].list.hud[i].data.mouse, player.id)) {

					library.deleteArrayValue(scenes[player.scene].list.hud[i].data.mouse, player.id);

					library._callEvent('onHudMouseLeave', scenes[player.scene].list.hud[i], [ 
						player
					]);

				}
			}

			library._callEvent('onPlayerDisconnect', player);

			library.deleteArrayValue(scenes[player.scene].list.player, player);
			library.clearObject(player);

		})

		.on('controller', function(data) {

			library._callEvent(data.key, player, data.params);

		});

	});

	// Отправка пакетов клиенту

	(function loopProcess() { 

		library._loopStart(loopProcess);

		for(var i = 0; i < scenes.length; ++i) {

			library._callEvent('onSceneUpdate', scenes[i]);

			for(var k = 0; k < scenes[i].list.hud.length; ++k) {
				library._callEvent('onHudUpdate', scenes[i].list.hud[k]);
			}

			for(var k = 0; k < scenes[i].list.object.length; ++k) {
				library._callEvent('onObjectUpdate', scenes[i].list.object[k]);
			}

			for(var k = 0; k < scenes[i].list.player.length; ++k) {

				library._callEvent('onPlayerUpdate', scenes[i].list.player[k]);

				if(!scenes[i].list.player[k].id) {
					continue;
				}

				var currentList = {
						hud: [],
						object: []
					};

				for(var j = 0; j < scenes[i].list.hud.length; ++j) {

					if(!scenes[i].list.hud[j].isRender()) {
						continue;
					}

					currentList.hud.push(scenes[i].list.hud[j]);

				}

				for(var j = 0; j < scenes[i].list.object.length; ++j) {

					if(!scenes[i].list.object[j].isRender(scenes[i].list.player[k])) {
						continue;
					}

					currentList.object.push(scenes[i].list.object[j]);

				}

				scenes[i].list.player[k].socket.emit('sendMainPackage', JSON.stringify(currentList));

			}

		}

	})();

};