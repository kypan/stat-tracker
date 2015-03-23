var Main = React.createClass({
	loadStatsFromServer: function() {
		$.ajax({
			url: '/stats',
			dataType: 'json',
			success: function(data) {
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
        console.error('/stats', status, err.toString());
      }.bind(this)
		});
	},
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		this.loadStatsFromServer();
    setInterval(this.loadStatsFromServer, this.props.pollInterval);
	},
	handleRecordShot: function(FGAttempt) {
		$.ajax({
      url: '/stats/recordShot',
      dataType: 'json',
      type: 'POST',
      data: FGAttempt,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error('/stats/shot', status, err.toString());
      }.bind(this)
    });
	},
	handleResetStats: function() {
		if(window.confirm("Are you sure?")) {
			$.ajax({
				url: '/stats/reset',
				dataType: 'json',
				type: 'PUT',
				success: function(data) {
					this.setState({data: data});
				}.bind(this),
	      error: function(xhr, status, err) {
	        console.error('/stats/reset', status, err.toString());
	      }.bind(this)
			});
		}
		else
			React.findDOMNode(this.refs.resetButton).blur();
	},
	render: function() {
		return (
			<div className="main">
				<Clock />
				<CurrentPlayers />
				<ShotChart data={this.state.data} onRecordShot={this.handleRecordShot} ref="shotChart"/>
				<BoxScore data={this.state.data} />
				<OtherStats />
				<button className="btn btn-lg btn-danger reset-btn" onClick={this.handleResetStats} ref="resetButton">RESET STATS</button>
			</div>
		);
	}
});

var ShotChart = React.createClass({
	player: null,
	posX: null,
	posY: null,
	modalX: null,
	modalY: null,
	made: false,
	getInitialState: function() {
		return {showShooterModal: false, showAssisterModal: false, showShotMap: false};
	},
	handleClick: function(e) {
		e.preventDefault();
		if(this.state.showShooterModal || this.state.showAssisterModal)
			return;
		this.posX = e.pageX - $(".shot-chart").offset().left - 337;
		this.posY = -(e.pageY - $(".shot-chart").offset().top);
		this.modalX = e.pageX;
		this.modalY = e.pageY;
		this.setState({showShooterModal: true});
	},
	handleShooterSubmit: function(data) {
		if(!data.made) {
			this.props.onRecordShot({number: data.player, x: this.posX, y: this.posY, made: data.made});
			this.reset();
		}
		else {
			this.player = data.player;
			this.made = data.made;
			this.setState({showShooterModal: false, showAssisterModal: true});
		}
	},
	handleAssisterSubmit: function(data) {
		this.props.onRecordShot({number: this.player, x: this.posX, y: this.posY, made: this.made, assistedBy: data.assister});
		this.reset();
	},
	toggleShotMap: function(e) {
		e.preventDefault();
		e.stopPropagation();
		var show = !this.state.showShotMap;
		this.setState({showShotMap: show});
		React.findDOMNode(this.refs.toggleButton).blur();
	},
	reset: function() {
		this.posX = null;
		this.posY = null;
		modalX: null;
		modalY: null;
		this.player = null;
		this.made = false;
		this.setState({showShooterModal: false, showAssisterModal: false});
	},
	render: function() {
		return (
			<div className="shot-chart" onClick={this.handleClick}>
				<img src="/img/shot_chart.png" />
				<button className="btn btn-sm btn-primary toggle-btn" onClick={this.toggleShotMap} ref="toggleButton">Toggle Shot Map</button>
				{this.state.showShotMap ? <ShotChartMap data={this.props.data} /> : null}
				{this.state.showShooterModal ?
				 <ShotChartShooterModal data={this.props.data}
				 												modalX={this.modalX}
				 												modalY={this.modalY}
				 												onShooterSubmit={this.handleShooterSubmit} /> : null}
				{this.state.showAssisterModal ?
				 <ShotChartAssisterModal data={this.props.data}
				 												 modalX={this.modalX}
				 												 modalY={this.modalY}
				 												 shooter={this.player}
				 												 onAssisterSubmit={this.handleAssisterSubmit} /> : null}
			</div>
		);
	}
});

var ShotChartMap = React.createClass({
	selectedPlayer: null,
	getInitialState: function() {
		return {selectedPlayer: false};
	},
	handleFilterPlayerFocus: function(e) {
		e.preventDefault();
		e.stopPropagation();
		playerDropdown = document.getElementById("shot-map-player-filter");
		_.forEach(this.props.data, function(player) {
			playerDropdown.options.add(new Option('#'+player.number+' '+player.name, player.number));
		});
		$('#shot-map-player-filter').change(function() {
			var number = $('select option:selected').val();
			if(number) {
				this.selectedPlayer = _.find(this.props.data, function(player) {
															return player.number === number;
														});
				console.log(this.selectedPlayer);
				this.setState({selectedPlayer: true});
			}
			else
				this.setState({selectedPlayer: false});
		}.bind(this));
	},
	handleFilterPlayerClick: function(e) {
		e.preventDefault();
		e.stopPropagation();
	},
	render: function() {
		return (
			<div className="shot-chart-map">
				{this.state.selectedPlayer ?
					<ShotMarkerArray player={this.selectedPlayer} /> :
					this.props.data.map(function(player) {
						return (
							<ShotMarkerArray player={player} key={player.number} />
						);
					})
				}
				<select id="shot-map-player-filter" onFocus={this.handleFilterPlayerFocus}
																						onClick={this.handleFilterPlayerClick}
																						ref="playerFilter">
					<option value="" selected>All</option>
				</select>
			</div>
		);
	}
});

var ShotMarkerArray = React.createClass({
	render: function() {
		return (
			<div className="shot-marker-array">
				{this.props.player.attemptedFG.map(function(fg, index) {
					return (
						<ShotMarker fg={fg} key={index}/>
					);
				})}
			</div>
		);
	}
});

var ShotMarker = React.createClass({
	componentDidMount: function() {
		$(React.findDOMNode(this.refs.shot)).css({
			left: Number(this.props.fg.x) + 337,
			top: -(this.props.fg.y)
		});
	},
	componentDidUpdate: function() {
		$(React.findDOMNode(this.refs.shot)).css({
			left: Number(this.props.fg.x) + 337,
			top: -(this.props.fg.y)
		});
	},
	render: function() {
		if(this.props.fg.made === "true") {
			var markerClass = "made-shot";
			var faClass = "fa fa-circle";
		}
		else {
			var markerClass = "missed-shot";
			var faClass = "fa fa-times";
		}
		return (
			<div className={markerClass} ref="shot">
				<i className={faClass}></i>
			</div>
		);
	}
});

var ShotChartShooterModal = React.createClass({
	getInitialState: function() {
		return {showShooterOptions: true};
	},
	componentDidMount: function() {
		$(".shot-chart-modal").css({
			left: this.props.modalX,
			top: this.props.modalY
		});
	},
	handleSelectPlayerFocus: function(e) {
		e.preventDefault();
		this.setState({showShooterOptions: true});
		shooterDropdown = document.getElementById("shooter-options");
		_.forEach(this.props.data, function(player) {
			shooterDropdown.options.add(new Option('#'+player.number+' '+player.name, player.number));
		});
	},
	handleMadeClick: function(e) {
		e.preventDefault();
		var shooter = this.refs.shooterSelect.getDOMNode().value;
		this.props.onShooterSubmit({player: shooter, made: true});
		this.refs.shooterSelect.getDOMNode().value = '';
	},
	handleMissedClick: function(e) {
		e.preventDefault();
		var shooter = this.refs.shooterSelect.getDOMNode().value;
		this.props.onShooterSubmit({player: shooter, made: false});
		this.refs.shooterSelect.getDOMNode().value = '';
	},
	render: function() {
		return (
			<div>
				<div className="modal-bg modal-bg-clear"></div>
				<div className="shot-chart-modal">
					<span>Who took the shot?</span>
					<select id="shooter-options" onFocus={this.handleSelectPlayerFocus} ref="shooterSelect">
						<option value="" disabled selected>Select player...</option>
					</select>
					<button className="made-btn" onClick={this.handleMadeClick}>MADE</button>
					<button className="missed-btn" onClick={this.handleMissedClick}>MISSED</button>
				</div>
			</div>
		);
	}
});

var ShotChartAssisterModal = React.createClass({
	getInitialState: function() {
		return {showAssisterOptions: false};
	},
	componentDidMount: function() {
		$(".shot-chart-modal").css({
			left: this.props.modalX,
			top: this.props.modalY
		});
	},
	handleSelectAssisterFocus: function(e) {
		e.preventDefault();
		this.setState({showAssisterOptions: true});
		var _this = this;
		var assisterOptions = _.filter(this.props.data, function(player) {
			return player.number !== _this.props.shooter;
		});
		assisterDropdown = document.getElementById("assister-options");
		_.forEach(assisterOptions, function(assister) {
			assisterDropdown.options.add(new Option('#'+assister.number+' '+assister.name, assister.number));
		});
	},
	handleDoneClick: function(e) {
		e.preventDefault();
		var assister = this.refs.assisterSelect.getDOMNode().value;
		this.props.onAssisterSubmit({assister: assister});
		this.refs.assisterSelect.getDOMNode().value='';
	},
	handleNoAssistClick: function(e) {
		e.preventDefault();
		this.props.onAssisterSubmit({assister: null});
	},
	render: function() {
		return (
			<div>
				<div className="modal-bg modal-bg-clear"></div>
				<div className="shot-chart-modal">
					<span>Who Assisted?</span>
					<select id="assister-options" onFocus={this.handleSelectAssisterFocus} ref="assisterSelect">
						<option value="" disabled selected>Select player...</option>
					</select>
					<button className="done-btn" onClick={this.handleDoneClick}>DONE</button>
					<button className="done-btn" onClick={this.handleNoAssistClick}>No Assist</button>
				</div>
			</div>
		);
	}
});

var OtherStats = React.createClass({
	render: function() {
		return (
			<div className="other-stats">
				Enter non-shooting stats here.
			</div>
		);
	}
});

var Clock = React.createClass({
	render: function() {
		return (
			<div className="clock">
				Tick tock, tick tock.
			</div>
		);
	}
});

var CurrentPlayers = React.createClass({
	render: function() {
		return (
			<div className="current-players">
				These 5 are on the floor.
			</div>
		);
	}
});

var BoxScore = React.createClass({
	var totals = []
	for (i = 0; i <= 12; i++) {
		totals.push(0);
	}
	// totalMadeFG: null,
	// totalAttemptedFG: null,
	// totalMadeThrees: null,
	// totalAttemptedThrees: null,
	// totalMadeFT: null,
	// totalAttemptedFT: null,
	// totalRebounds: null,
	// totalAssists: null,
	// totalSteals: null,
	// totalBlocks: null,
	// totalTurnovers: null,
	// totalFouls: null,
	// totalPoints: null,
	updateTotals: function() {
		var _this = this;

			var str = $('td:nth-child(3)').text();
			_this.totals[0] += parseInt(str[0]) || 0;
			_this.totals[1] += parseInt(str[2]) || 0;
		$('td:nth-child(4)').each(function() {
			var str = $(this).text();
			_this.totals[2] += parseInt(str[0]) || 0;
			_this.totals[3] += parseInt(str[2]) || 0;
		});
		$('td:nth-child(5)').each(function() {
			var str = $(this).text();
			_this.totals[4] += parseInt(str[0]) || 0;
			_this.totlas[5] += parseInt(str[2]) || 0;
		});
		for (i = 6; i <= 12; i++) {
			var selector = 'td:nth-child(' + String(i) + ')';
			$(selector).each(function() {
				_this.totals[i] += parseInt($(this).text()) || 0;
			});
		}
		// $('td:nth-child(6)').each(function() {
		// 	_this.totalRebounds += parseInt($(this).text()) || 0;
		// });
		// $('td:nth-child(7)').each(function() {
		// 	_this.totalAssists += parseInt($(this).text()) || 0;
		// });
		// $('td:nth-child(8)').each(function() {
		// 	_this.totalSteals += parseInt($(this).text()) || 0;
		// });
		// $('td:nth-child(9)').each(function() {
		// 	_this.totalBlocks += parseInt($(this).text()) || 0;
		// });
		// $('td:nth-child(10)').each(function() {
		// 	_this.totalTurnovers += parseInt($(this).text()) || 0;
		// });
		// $('td:nth-child(11)').each(function() {
		// 	_this.totalFouls += parseInt($(this).text()) || 0;
		// });
		// $('td:nth-child(12)').each(function() {
		// 	_this.totalPoints += parseInt($(this).text()) || 0;
		// });
	},
	render: function() {
		return (
			<div className="box-score">
				<table className="box-score-table">
					<tr className="box-score-header">
						<th>#</th>
						<th>Name</th>
						<th>FG</th>
						<th>3PT</th>
						<th>FT</th>
						<th>REB</th>
						<th>AST</th>
						<th>STL</th>
						<th>BLK</th>
						<th>TO</th>
						<th>PF</th>
						<th>PTS</th>
					</tr>
					{this.props.data.map(function(player, index) {
						return <BoxScoreRow player={player} key={player.number} onUpdate={this.updateTotals}/>
					})}
					<tr className="box-score-totals">
						<th></th>
						<th>TOTAL</th>
						<th>{this.totalMadeFG}-{this.totalAttemptedFG}</th>
						<th>{this.totalMadeThrees}-{this.totalAttemptedThrees}</th>
						<th>{this.totalMadeFT}-{this.totalAttemptedFT}</th>
						<th>{this.totalRebounds}</th>
						<th>{this.totalAssists}</th>
						<th>{this.totalSteals}</th>
						<th>{this.totalBlocks}</th>
						<th>{this.totalTurnovers}</th>
						<th>{this.totalFouls}</th>
						<th>{this.totalPoints}</th>
					</tr>
				</table>
			</div>
		);
	}
});

var BoxScoreRow = React.createClass({
	componentDidUpdate: function() {
		this.props.onUpdate();
	},
	render: function() {
		var player = this.props.player;
		var attemptedFG = player.attemptedFG.length;
		var madeFG = _.filter(player.attemptedFG, function(fg) {
			return fg.made === "true";
		}).length;
		var attemptedThreesList = _.filter(player.attemptedFG, function(fg) {
			return (Math.pow(Number(fg.x), 2) + Math.pow(Number(fg.y), 2)) > 90000;
		})
		var attemptedThrees = attemptedThreesList.length;
		var madeThrees = _.filter(attemptedThreesList, function(fg) {
			return fg.made === "true";
		}).length;
		var attemptedFT = player.attemptedFT.length;
		var madeFT = _.filter(player.attemptedFT, function(ft) {
			return ft.made === "true";
		}).length;
		var points = (madeFG - madeThrees) * 2 + madeThrees * 3 + madeFT;
		return (
			<tr className="box-score-row">
				<td>{player.number}</td>
				<td>{player.name}</td>
				<td>{madeFG}-{attemptedFG}</td>
				<td>{madeThrees}-{attemptedThrees}</td>
				<td>{madeFT}-{attemptedFT}</td>
				<td>{player.rebounds}</td>
				<td>{player.assists}</td>
				<td>{player.steals}</td>
				<td>{player.blocks}</td>
				<td>{player.turnovers}</td>
				<td>{player.fouls}</td>
				<td>{points}</td>
			</tr>
		);
	}
});

React.render(
	<Main pollInterval={200} />,
	document.getElementById('stat-tracker')
);