document.addEventListener("DOMContentLoaded", () => {
	let light = true,
		lives,
		roundreq,
		rounds = 0,
		wins = 0,
		loses = 0,
		score = 0,
		skippostround = false,
		showstatistics = false,
		showsettings = false,
		modemode = 0,
		categorymode = 0,
		xValues = [],
		yValues = [],
		threshold = -20,
		ratio = 4,
		attack = 5,
		gainreduction = 0,
		ratioArr = [2, 4, 8, 16],
		attackArr = [1, 3, 5, 10, 30],
		gainReductionArr = [1, 3, 6, 12],
		answertrack = {},
		answer,
		compression = false,
		compressor = null,
		compressionon = 1,
		soundplayed = false,
		submitted = false,
		maxgainreduction = Number.MAX_VALUE,
		menu = true,
		gain = null,
		fileselected = 0;
	document.querySelectorAll(".buttoncontainer").forEach((e, i) => {
		Array.from(e.children).forEach((f, j) => {
			f.addEventListener("click", () => {
				switch (i) {
					case 0:
						document.querySelectorAll(".buttoncontainer")[i].children[modemode].classList.remove("green");
						modemode = j;
						document.querySelectorAll(".buttoncontainer")[i].children[modemode].classList.add("green");
						break;
					case 1:
						document.querySelectorAll(".buttoncontainer")[i].children[categorymode].classList.remove("green");
						categorymode = j;
						document.querySelectorAll(".buttoncontainer")[i].children[categorymode].classList.add("green");
						break;
					case 2:
						if (j === 0) {
							showsettings = !showsettings;
							showsettings ? document.querySelectorAll(".buttoncontainer")[i].children[0].classList.add("green") : document.querySelectorAll(".buttoncontainer")[i].children[0].classList.remove("green");
						}
						if (j === 1) {
							showstatistics = !showstatistics;
							showstatistics ? document.querySelectorAll(".buttoncontainer")[i].children[1].classList.add("green") : document.querySelectorAll(".buttoncontainer")[i].children[1].classList.remove("green");
						}
						if (j === 2) {
							skippostround = !skippostround;
							skippostround ? document.querySelectorAll(".buttoncontainer")[i].children[2].classList.add("green") : document.querySelectorAll(".buttoncontainer")[i].children[2].classList.remove("green");
						}
						break;

					default:
						break;
				}
			});
		});
	});
	function restart() {
		if (modemode !== 6) {
			waiting = false;
			submitted = false;
			document.getElementById("afterbuttons").style.display = "none";
			document.getElementById("submit").style.display = "flex";
			maxgainreduction = Number.MAX_VALUE;
			soundplayed = false;
			context.close();
			compressedcontext.close();
			context = new AudioContext();
			compressedcontext = new AudioContext();
			document.getElementById("fader").style.display = "none";

			answertrack = files[Math.floor(Math.random() * files.length)];
			answer = Math.floor(Math.random() * answertrack.configs.length);
			let date1 = Date.now();
			let track = null,
				compressedtrack = null;
			document.querySelectorAll(".text > span")[0].textContent = answertrack.title + " (Before)";
			document.querySelectorAll(".text > span")[1].textContent = answertrack.title + " (After)";
			document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: ???";
			document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: ???";
			document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: ???";
			document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: ???";
			if (categorymode !== 0 && categorymode !== 4) {
				document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: " + answertrack.configs[answer].threshold + "dB";
				document.getElementById("canvasparent").style.opacity = 0;
			}
			if (categorymode !== 1 && categorymode !== 4) {
				document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: " + answertrack.configs[answer].ratio + ":1";
				document.querySelectorAll("#compbottom > div")[0].style.opacity = 0;
			}
			if (categorymode !== 2 && categorymode !== 4) {
				document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: " + answertrack.configs[answer].attack * 1000 + "ms";
				document.querySelectorAll("#compbottom > div")[1].style.opacity = 0;
			}
			if (categorymode !== 3 && categorymode !== 4) {
				document.getElementById("gainreductionslider").style.opacity = 0;
				document.getElementById("guessline").style.opacity = 0;
			}
			if (categorymode === 0) ratio = answertrack.configs[answer].ratio;
			document.getElementById("audiostatus").textContent = "Audio file is being decoded... Please wait...";
			fetch(answertrack.path)
				.then((response) => response.arrayBuffer())
				.then((buffer) => context.decodeAudioData(buffer))
				.then((decodedData) => {
					track = context.createBufferSource();
					track.buffer = decodedData;
					document.getElementById("audiostatus").textContent = "Audio file decoded!";
					track.connect(context.destination);
					track.loop = true;
					track.start();
					if (compression) context.suspend();
				});
			fetch(answertrack.path)
				.then((response) => response.arrayBuffer())
				.then((buffer) => compressedcontext.decodeAudioData(buffer))
				.then((decodedData) => {
					compressedtrack = compressedcontext.createBufferSource();
					compressedtrack.buffer = decodedData;
					document.getElementById("audiostatus").textContent = "Audio file decoded!";
					compressor = new DynamicsCompressorNode(compressedcontext);
					compressor.attack.setValueAtTime(answertrack.configs[answer].attack, compressedcontext.currentTime);
					compressor.ratio.setValueAtTime(answertrack.configs[answer].ratio, compressedcontext.currentTime);
					compressor.threshold.setValueAtTime(answertrack.configs[answer].threshold, compressedcontext.currentTime);
					gain = compressedcontext.createGain();
					compressedtrack.connect(compressor);
					compressor.connect(gain);
					gain.connect(compressedcontext.destination);
					compressedtrack.loop = true;
					compressedtrack.start();
					if (!compression) compressedcontext.suspend();
					trackduration = compressedtrack.buffer.duration;
					let date2 = Date.now();
					document.getElementById("audiostatus").textContent = "Audio is playing! (" + (date2 - date1) + "ms to load)";
				});
			document.getElementById("submit").textContent = "Play Compressed Sample in Full to Submit";
			soundplayed = false;
			if (modemode <= 2) document.getElementById("gamedisplay").textContent = "Lives: " + lives;
			if (modemode >= 3) document.getElementById("gamedisplay").textContent = "Score: " + score;
			document.getElementById("settings").style.opacity = showsettings ? "1" : "0";
			document.getElementById("statisticsdisplay").style.opacity = showstatistics ? "1" : "0";
			document.getElementById("settings").textContent = `Mode: ${["1 Life", "3 Lives", "5 Lives", "10 Rounds", "25 Rounds", "Endless", "Explore"][modemode]}\nCategory: ${["Threshold", "Ratio", "Attack", "Gain Reduction", "All"][categorymode]}`;
			menu = false;
		} else {
			compressor.attack.setValueAtTime(attack / 1000, compressedcontext.currentTime);
			compressor.ratio.setValueAtTime(ratio, compressedcontext.currentTime);
			compressor.threshold.setValueAtTime(threshold, compressedcontext.currentTime);
			document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: " + threshold + "dB";
			document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: " + ratio + ":1";
			document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: " + attack + "ms";
		}
	}
	let context, compressedcontext, trackduration;
	function fade2(start, end, current, time) {
		document.getElementById("game").style.display = "flex";
		document.getElementById("fader").style.opacity = current;
		if (current <= end) {
			context = new AudioContext();
			compressedcontext = new AudioContext();
			document.getElementById("fader").style.display = "none";
			lives = [1, 3, 5, Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE][modemode];
			roundreq = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, 10, 25, Number.MAX_VALUE][modemode];

			answertrack = files[Math.floor(Math.random() * files.length)];
			answer = Math.floor(Math.random() * answertrack.configs.length);
			let date1 = Date.now();
			let track = null,
				compressedtrack = null;
			document.querySelectorAll(".text > span")[0].textContent = answertrack.title + " (Before)";
			document.querySelectorAll(".text > span")[1].textContent = answertrack.title + " (After)";
			if (categorymode !== 0 && categorymode !== 4 && modemode !== 6) {
				document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: " + answertrack.configs[answer].threshold + "dB";
				document.getElementById("canvasparent").style.opacity = 0;
			}
			if (categorymode !== 1 && categorymode !== 4 && modemode !== 6) {
				document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: " + answertrack.configs[answer].ratio + ":1";
				document.querySelectorAll("#compbottom > div")[0].style.opacity = 0;
			}
			if (categorymode !== 2 && categorymode !== 4 && modemode !== 6) {
				document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: " + answertrack.configs[answer].attack * 1000 + "ms";
				document.querySelectorAll("#compbottom > div")[1].style.opacity = 0;
			}
			if (categorymode !== 3 && categorymode !== 4 && modemode !== 6) {
				document.getElementById("gainreductionslider").style.opacity = 0;
				document.getElementById("guessline").style.opacity = 0;
			}
			if (categorymode === 0) ratio = answertrack.configs[answer].ratio;
			document.getElementById("audiostatus").textContent = "Audio file is being decoded... Please wait...";
			if (modemode === 6) {
				document.getElementById("filelabel").style.display = "inline";
				document.getElementById("filechooser").style.display = "block";
				document.getElementById("configlabel").style.display = "inline";
				document.getElementById("configchooser").style.display = "block";
				document.getElementById("resetgainreduction").style.display = "block";
				document.getElementById("import").style.display = "block";
				document.getElementById("submit").textContent = "Change Track to Selected File";
				for (i in files) {
					let file = files[i];
					let option = document.createElement("option");
					option.value = file.path;
					option.textContent = file.path;
					document.getElementById("filechooser").appendChild(option);
				}
				fileselected = 0;
				for (let i = 0; i < files[fileselected].configs.length; i++) {
					let option = document.createElement("option");
					option.value = i;
					option.textContent = i;
					document.getElementById("configchooser").appendChild(option);
				}
				document.querySelectorAll(".text > span")[0].textContent = files[0].path + " (Before)";
				document.querySelectorAll(".text > span")[1].textContent = files[0].path + " (After)";
				document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: " + threshold + "dB";
				document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: " + ratio + ":1";
				document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: " + attack + "ms";
				fetch(files[0].path)
					.then((response) => response.arrayBuffer())
					.then((buffer) => context.decodeAudioData(buffer))
					.then((decodedData) => {
						track = context.createBufferSource();
						track.buffer = decodedData;
						document.getElementById("audiostatus").textContent = "Audio file decoded!";
						track.connect(context.destination);
						track.loop = true;
						track.start();
						if (compression) context.suspend();
					});
				fetch(files[0].path)
					.then((response) => response.arrayBuffer())
					.then((buffer) => compressedcontext.decodeAudioData(buffer))
					.then((decodedData) => {
						compressedtrack = compressedcontext.createBufferSource();
						compressedtrack.buffer = decodedData;
						document.getElementById("audiostatus").textContent = "Audio file decoded!";
						compressor = new DynamicsCompressorNode(compressedcontext);
						compressor.attack.setValueAtTime(0.01, compressedcontext.currentTime);
						compressor.ratio.setValueAtTime(4, compressedcontext.currentTime);
						compressor.threshold.setValueAtTime(-40, compressedcontext.currentTime);
						gain = compressedcontext.createGain();
						compressedtrack.connect(compressor);
						compressor.connect(gain);
						gain.connect(compressedcontext.destination);
						compressedtrack.loop = true;
						compressedtrack.start();
						if (!compression) compressedcontext.suspend();
						trackduration = compressedtrack.buffer.duration;
						let date2 = Date.now();
						document.getElementById("audiostatus").textContent = "Audio is playing! (" + (date2 - date1) + "ms to load)";
					});
			} else {
				fetch(answertrack.path)
					.then((response) => response.arrayBuffer())
					.then((buffer) => context.decodeAudioData(buffer))
					.then((decodedData) => {
						track = context.createBufferSource();
						track.buffer = decodedData;
						document.getElementById("audiostatus").textContent = "Audio file decoded!";
						track.connect(context.destination);
						track.loop = true;
						track.start();
						if (compression) context.suspend();
					});
				fetch(answertrack.path)
					.then((response) => response.arrayBuffer())
					.then((buffer) => compressedcontext.decodeAudioData(buffer))
					.then((decodedData) => {
						compressedtrack = compressedcontext.createBufferSource();
						compressedtrack.buffer = decodedData;
						document.getElementById("audiostatus").textContent = "Audio file decoded!";
						compressor = new DynamicsCompressorNode(compressedcontext);
						compressor.attack.setValueAtTime(answertrack.configs[answer].attack, compressedcontext.currentTime);
						compressor.ratio.setValueAtTime(answertrack.configs[answer].ratio, compressedcontext.currentTime);
						compressor.threshold.setValueAtTime(answertrack.configs[answer].threshold, compressedcontext.currentTime);
						gain = compressedcontext.createGain();
						compressedtrack.connect(compressor);
						compressor.connect(gain);
						gain.connect(compressedcontext.destination);
						compressedtrack.loop = true;
						compressedtrack.start();
						if (!compression) compressedcontext.suspend();
						trackduration = compressedtrack.buffer.duration;
						let date2 = Date.now();
						document.getElementById("audiostatus").textContent = "Audio is playing! (" + (date2 - date1) + "ms to load)";
					});
			}
			if (modemode <= 2) document.getElementById("gamedisplay").textContent = "Lives: " + lives;
			if (modemode >= 3) document.getElementById("gamedisplay").textContent = "Score: " + score;
			document.getElementById("settings").style.opacity = showsettings ? "1" : "0";
			document.getElementById("statisticsdisplay").style.opacity = showstatistics ? "1" : "0";
			document.getElementById("settings").textContent = `Mode: ${["1 Life", "3 Lives", "5 Lives", "10 Rounds", "25 Rounds", "Endless", "Explore"][modemode]}\nCategory: ${["Threshold", "Ratio", "Attack", "Gain Reduction", "All"][categorymode]}`;
			menu = false;
			submitted = false;
			return;
		}
		setTimeout(fade2, 1, start, end, current + (end - start) / time, time);
	}
	function fade1(start, end, current, time) {
		document.getElementById("fader").style.opacity = current;
		if (current >= end) {
			document.getElementById("selectmenu").style.display = "none";
			setTimeout(fade2, 1, 1, 0, 1, 150);
			return;
		}
		setTimeout(fade1, 1, start, end, current + (end - start) / time, time);
	}
	function fade3(start, end, current, time) {
		document.getElementById("fader").style.opacity = current;
		if (current <= end) {
			document.getElementById("fader").style.display = "none";
			document.getElementById("selectmenu").style.display = "flex";
			document.getElementById("gamedisplay").textContent = "Menu";
			document.getElementById("statisticsdisplay").innerHTML = 'Round #1<span id="fpsdisplay"></span>';
			document.getElementById("afterbuttons").style.display = "none";
			document.getElementById("submit").style.display = "flex";
			document.getElementById("submit").textContent = "Play Compressed Sample in Full to Submit";
			document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: ???";
			document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: ???";
			document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: ???";
			soundplayed = false;
			rounds = 0;
			lives = Number.MAX_VALUE;
			wins = 0;
			loses = 0;
			roundreq = Number.MAX_VALUE;
			threshold = -20;
			attack = 5;
			ratio = 2;
			gainreduction = 0;
			answer = 0;
			score = 0;
			maxgainreduction = Number.MAX_VALUE;
			compressor = null;
			soundplayed = false;
			context.close();
			compressedcontext.close();
			submitted = false;
			return;
		}
		setTimeout(fade3, 1, start, end, current + (end - start) / time, time);
	}
	function fade4(start, end, current, time) {
		document.getElementById("fader").style.opacity = current;
		if (current >= end) {
			document.getElementById("game").style.display = "none";
			setTimeout(fade3, 1, 1, 0, 1, 300);
			return;
		}
		setTimeout(fade4, 1, start, end, current + (end - start) / time, time);
	}
	document.getElementById("play").addEventListener("click", () => {
		document.getElementById("fader").style.display = "block";
		fade1(0, 1, 0, 150);
	});
	let chart = new Chart("compressiongraph", {
		//setup chart at the very beginning
		type: "line",
		data: {
			labels: xValues,
			datasets: [],
		},
		options: {
			plugins: {
				tooltip: {
					enabled: false,
				},
				legend: {
					display: false,
				},
				dragData: {
					round: 1,
					showTooltip: false,
					dragX: true,
					drayY: true,
					onDrag: function (e, datasetIndex, index, value) {
						threshold = value.x;
						chart.data.datasets[1].data[0].y = threshold;
						if (modemode === 6) restart();
						updateChart();
					},
				},
			},
			responsive: true,
			aspectRatio: 1,
			events: [],
			scales: {
				y: {
					suggestedMin: -60,
					suggestedMax: 0,
					title: {
						display: true,
						text: "After Compression (dB)",
						font: {
							family: '"Lexend", sans-serif',
							weight: "600",
						},
					},
					grid: {
						color: "#00339922",
						lineWidth: 2,
					},
					ticks: {
						stepSize: 10,
						color: "black",
						font: {
							family: '"Lexend", sans-serif',
							weight: "600",
						},
					},
				},
				x: {
					type: "linear",
					min: -60,
					max: 0,
					title: {
						display: true,
						text: "Before Compression (dB)",
						font: {
							family: '"Lexend", sans-serif',
							weight: "600",
						},
					},
					grid: {
						color: "#00339922",
						lineWidth: 2,
					},
					ticks: {
						stepSize: 10,
						color: "black",
						font: {
							family: '"Lexend", sans-serif',
							weight: "600",
						},
					},
				},
			},
		},
	});
	function generateData(value, i1, i2, step = 1) {
		for (let x = i1; x <= i2; x += (i2 - i1) / step) {
			yValues.push(eval(value));
			xValues.push(x);
		}
	}
	function recalc(value) {
		for (let i = 0; i < xValues.length; i++) {
			x = xValues[i];
			yValues.push(eval(value));
		}
	}
	function generate() {
		let equation = "(x <= threshold) ? x : threshold + ((x - threshold) / ratio)";
		generateData(equation, -60, 5, 100);
	}
	function updateChart() {
		yValues = [];
		let equation = "(x <= threshold) ? x : threshold + ((x - threshold) / ratio)";
		recalc(equation);
		chart.data.datasets[0].data = yValues;
	}
	generate();
	chart.data.datasets.push({
		type: "line",
		fill: true,
		pointRadius: 0,
		borderColor: "#003399",
		backgroundColor: "transparent",
		data: yValues,
		label: xValues,
		dragData: false,
	});
	(chart.data.datasets.push({
		type: "scatter",
		fill: true,
		backgroundColor: "#003399",
		pointRadius: 5,
		borderColor: "#003399",
		data: [{ x: threshold, y: threshold }],
		pointHitRadius: 50,
		dragData: true,
	}),
		(chart.data.labels = xValues));
	chart.options.scales.x.labels = xValues;
	chart.update("none");
	let fps, fps1;
	function tick() {
		//fps tracking for performance issues
		let fps2 = Date.now();
		fps = fps2 - fps1;
		if (document.getElementById("fpsdisplay") !== null) document.getElementById("fpsdisplay").textContent = "FPS: " + (1000 / fps).toFixed(4) + " (" + fps + "ms)";
		if (!menu) {
			if (compressor !== null) ((gain.gain.value = Math.pow(10, compressor.reduction / 20)), compressedcontext.currentTime);
			if (((categorymode !== 3 && categorymode !== 4) || modemode === 6) && compressor !== null) {
				let height = Math.min(100 * (compressor.reduction / -15), 100);
				document.getElementById("gainlevel").style.height = height + "%";
				document.getElementById("gainlevel").style.top = 100 - height + "%";
				document.getElementById("labels").style.bottom = height + "%";
				document.getElementById("gainline").style.top = 100 - 100 * (maxgainreduction / -15) + "%";
			}
			if (compressor !== null && compressedcontext.currentTime >= trackduration) maxgainreduction = Math.max(Math.min(maxgainreduction, compressor.reduction), -15);
			if (((categorymode !== 3 && categorymode !== 4) || modemode === 6) && compressor !== null) {
				document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: " + Math.round(maxgainreduction * 10) / 10 + "dB";
				if (maxgainreduction === -15) document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: -15dB or more";
			}
			if (maxgainreduction >= 0) {
				if ((categorymode !== 3 && categorymode !== 4) || modemode === 6) {
					document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: Waiting...";
				} else {
					document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: ???";
				}
				document.getElementById("gainline").style.top = "100000000000%";
			}
			if (compressedcontext !== undefined && compressedcontext.currentTime >= trackduration * 2 && !soundplayed && modemode !== 6) {
				soundplayed = true;
				document.getElementById("submit").textContent = "SUBMIT GUESS";
			}
			if (compressionon !== 2) {
				document.getElementById("gainlevel").style.height = "0%";
				document.getElementById("gainlevel").style.top = "100%";
				document.getElementById("labels").style.bottom = "0%";
				document.getElementById("gainline").style.top = "100000000000%";
			}
		}
		fps1 = fps2;
		window.requestAnimationFrame(tick);
	}
	fps1 = new Date();
	window.requestAnimationFrame(tick);
	document.getElementById("play1").addEventListener("click", () => {
		if (compressionon === 1) {
			context.suspend();
			document.getElementById("play1").classList.remove("green");
			compressionon = 0;
			compression = false;
		} else {
			context.resume();
			document.getElementById("play1").classList.add("green");
			document.getElementById("play2").classList.remove("green");
			if (compressionon === 2) compressedcontext.suspend();
			compressionon = 1;
			compression = false;
		}
	});
	document.getElementById("play2").addEventListener("click", () => {
		if (compressionon === 2) {
			document.getElementById("play2").classList.remove("green");
			compressedcontext.suspend();
			compressionon = 0;
			compression = false;
		} else {
			compressedcontext.resume();
			document.getElementById("play2").classList.add("green");
			document.getElementById("play1").classList.remove("green");
			if (compressionon === 1) context.suspend();
			compressionon = 2;
			compression = true;
		}
	});
	document.addEventListener("keydown", (e) => {
		if (!menu) {
			if (e.key === "ArrowUp") {
				if (compressionon === 1) {
					context.suspend();
					document.getElementById("play1").classList.remove("green");
					compressionon = 0;
					compression = false;
				} else {
					context.resume();
					document.getElementById("play1").classList.add("green");
					document.getElementById("play2").classList.remove("green");
					if (compressionon === 2) compressedcontext.suspend();
					compressionon = 1;
					compression = false;
				}
			}
			if (e.key === "ArrowDown") {
				if (compressionon === 2) {
					document.getElementById("play2").classList.remove("green");
					compressedcontext.suspend();
					compressionon = 0;
					compression = false;
				} else {
					compressedcontext.resume();
					document.getElementById("play2").classList.add("green");
					document.getElementById("play1").classList.remove("green");
					if (compressionon === 1) context.suspend();
					compressionon = 2;
					compression = true;
				}
			}
		}
	});
	document.getElementById("ratioslider").addEventListener("input", (e) => {
		let value = parseInt(e.target.value);
		ratio = ratioArr.reduce((prev, curr) => {
			return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
		});
		e.target.value = ratio;
		document.getElementById("ratiodisplay").textContent = `Ratio: ${ratio}:1`;
		if (modemode === 6) restart();
		updateChart();
		chart.update("none");
	});
	document.getElementById("attackslider").addEventListener("input", (e) => {
		let value = parseInt(e.target.value);
		attack = attackArr.reduce((prev, curr) => {
			return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
		});
		e.target.value = attack;
		document.getElementById("attackdisplay").textContent = `Attack: ${attack}ms`;
		if (modemode === 6) restart();
	});
	document.getElementById("gainreductionslider").addEventListener("input", (e) => {
		let value = parseInt(e.target.value);
		gainreduction = gainReductionArr.reduce((prev, curr) => {
			return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
		});
		e.target.value = gainreduction;
		document.getElementById("guessline").style.top = 100 - 100 * (gainreduction / 15) + "%";
	});
	function submit() {
		if (modemode !== 6) {
			let result = false;
			submitted = true;
			let thresholdresult = Math.abs(threshold - answertrack.configs[answer].threshold) <= 5;
			let attackresult = Math.abs(attack / 1000 - answertrack.configs[answer].attack) === 0;
			let ratioresult = Math.abs(ratio - answertrack.configs[answer].ratio) === 0;
			let gainreductionresult =
				Math.abs(
					-gainreduction +
						gainReductionArr.reduce((prev, curr) => {
							return Math.abs(-curr - maxgainreduction) < Math.abs(-prev - maxgainreduction) ? curr : prev;
						}),
				) <= 0.5;
			if (thresholdresult && categorymode === 0) result = true;
			if (ratioresult && categorymode === 1) result = true;
			if (attackresult && categorymode === 2) result = true;
			if (gainreductionresult && categorymode === 3) result = true;
			if (thresholdresult && ratioresult && attackresult && gainreductionresult && categorymode === 4) result = true;
			if (result) {
				document.getElementById("thingy").textContent = "Correct!";
				document.getElementById("thingy").style.color = "var(--main3)";
				document.body.classList.add("green2");
				wins++;
				setTimeout(() => {
					document.body.classList.remove("green2");
				}, 3000);
			} else {
				document.getElementById("thingy").textContent = "Incorrect!";
				document.getElementById("thingy").style.color = "var(--main4)";
				document.body.classList.add("red");
				lives--;
				loses++;
				setTimeout(() => {
					document.body.classList.remove("red");
				}, 3000);
			}
			let oldscore = score * 1;
			document.getElementById("statisticsdisplay").innerHTML = "- Recent Round Statistics [guess/answer (+score)] -<br><br>";
			if (categorymode === 0 || categorymode === 4) {
				let increase = Math.round(1000 * (1 - Math.sqrt(Math.abs(threshold - answertrack.configs[answer].threshold) / 60))) / (categorymode === 4 ? 4 : 1);
				score += increase;
				document.getElementById("statisticsdisplay").innerHTML += "Threshold: <br>" + threshold + "/" + answertrack.configs[answer].threshold + " (+" + increase + ")<br>";
				document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: " + answertrack.configs[answer].threshold + "dB";
			}
			if (categorymode === 1 || categorymode === 4) {
				let increase = Math.round(1000 * (1 - Math.sqrt(Math.abs(attack / 1000 - answertrack.configs[answer].attack) / 0.03))) / (categorymode === 4 ? 4 : 1);
				score += increase;
				document.getElementById("statisticsdisplay").innerHTML += "Attack: <br>" + attack / 1000 + "/" + answertrack.configs[answer].attack + " (+" + increase + ")<br>";
				document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: " + answertrack.configs[answer].attack * 1000 + "ms";
			}
			if (categorymode === 2 || categorymode === 4) {
				let increase = Math.round(1000 * (1 - Math.sqrt(Math.abs(ratio - answertrack.configs[answer].ratio) / 16))) / (categorymode === 4 ? 4 : 1);
				score += increase;
				document.getElementById("statisticsdisplay").innerHTML += "Ratio: <br>" + ratio + "/" + answertrack.configs[answer].ratio + " (+" + increase + ")<br>";
				document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: " + answertrack.configs[answer].ratio + ":1";
			}
			if (categorymode === 3 || categorymode === 4) {
				let increase =
					Math.round(
						1000 *
							(1 -
								Math.sqrt(
									Math.abs(
										-gainreduction +
											gainReductionArr.reduce((prev, curr) => {
												return Math.abs(-curr - maxgainreduction) < Math.abs(-prev - maxgainreduction) ? curr : prev;
											}),
									) / 15,
								)),
					) / (categorymode === 4 ? 4 : 1);
				score += increase;
				document.getElementById("statisticsdisplay").innerHTML += "Gain Reduction: <br>" + -gainreduction + "/" + Math.round(maxgainreduction * 100) / 100 + " (+" + increase + ")<br>";
				document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: " + Math.round(maxgainreduction * 10) / 10 + "dB";
				if (maxgainreduction === -15) document.querySelectorAll(".text > ul > li")[3].textContent = "Gain Reduction: -15dB or more";
			}
			document.getElementById("statisticsdisplay").innerHTML += "Total Score Gain: <br>+" + (score - oldscore) + "<br>";
			rounds++;
			document.getElementById("statisticsdisplay").innerHTML +=
				"<br><br> Round #" + rounds.toFixed(2) + "<br> Wins: " + wins.toFixed(2) + "<br> Loses: " + loses.toFixed(2) + "<br> W/L: " + (wins / loses).toFixed(2) + "<br>Average Score per Round: " + (score / rounds).toFixed(2) + "<br> Score: " + score.toFixed(2) + '<br><span id="fpsdisplay"></span>';
			started = false;
			document.getElementById("afterbuttons").style.display = "flex";
			document.getElementById("submit").style.display = "none";
			if (modemode <= 2) document.getElementById("gamedisplay").textContent = "Lives: " + lives;
			if (modemode >= 3) document.getElementById("gamedisplay").textContent = "Score: " + score;
		} else {
			context.close();
			compressedcontext.close();
			document.getElementById("submit").textContent = "Change Track to Selected File";
			context = new AudioContext();
			compressedcontext = new AudioContext();
			document.querySelectorAll(".text > span")[0].textContent = document.getElementById("filechooser").value + " (Before)";
			document.querySelectorAll(".text > span")[1].textContent = document.getElementById("filechooser").value + " (After)";
			document.getElementById("audiostatus").textContent = "Audio file is being decoded... Please wait...";
			fileselected = files.findIndex((e) => {
				return e.path == document.getElementById("filechooser").value;
			});
			document.getElementById("configchooser").innerHTML = "";
			for (let i = 0; i < files[fileselected].configs.length; i++) {
					let option = document.createElement("option");
					option.value = i;
					option.textContent = i;
					document.getElementById("configchooser").appendChild(option);
				}
			fetch(document.getElementById("filechooser").value)
				.then((response) => response.arrayBuffer())
				.then((buffer) => context.decodeAudioData(buffer))
				.then((decodedData) => {
					track = context.createBufferSource();
					track.buffer = decodedData;
					document.getElementById("audiostatus").textContent = "Audio file decoded!";
					track.connect(context.destination);
					track.loop = true;
					track.start();
					if (compression) context.suspend();
				});
			fetch(document.getElementById("filechooser").value)
				.then((response) => response.arrayBuffer())
				.then((buffer) => compressedcontext.decodeAudioData(buffer))
				.then((decodedData) => {
					compressedtrack = compressedcontext.createBufferSource();
					compressedtrack.buffer = decodedData;
					document.getElementById("audiostatus").textContent = "Audio file decoded!";
					compressor = new DynamicsCompressorNode(compressedcontext);
					compressor.attack.setValueAtTime(attack / 1000, compressedcontext.currentTime);
					compressor.ratio.setValueAtTime(ratio, compressedcontext.currentTime);
					compressor.threshold.setValueAtTime(threshold, compressedcontext.currentTime);
					gain = compressedcontext.createGain();
					compressedtrack.connect(compressor);
					compressor.connect(gain);
					gain.connect(compressedcontext.destination);
					compressedtrack.loop = true;
					compressedtrack.start();
					if (!compression) compressedcontext.suspend();
					trackduration = compressedtrack.buffer.duration;
					let date2 = Date.now();
					document.getElementById("audiostatus").textContent = "Audio is playing! (" + (date2 - date1) + "ms to load)";
				});
		}
	}
	document.getElementById("submit").addEventListener("click", () => {
		if ((soundplayed && !menu && !submitted) || modemode === 6) submit();
	});
	document.getElementById("restart").addEventListener("click", () => {
		if (lives <= 0 || rounds > roundreq) {
			document.getElementById("fader").style.display = "block";
			context.close();
			compressedcontext.close();
			fade4(0, 1, 0, 150);
			menu = true;
		} else {
			restart();
		}
	});
	document.getElementById("chooseconfig").addEventListener("click", () => {
		let config = files[fileselected].configs[document.getElementById("configchooser").value];
		attack = config.attack * 1000;
		ratio = config.ratio;
		threshold = config.threshold;
		updateChart();
		chart.data.datasets.pop();
		(chart.data.datasets.push({
		type: "scatter",
		fill: true,
		backgroundColor: "#003399",
		pointRadius: 5,
		borderColor: "#003399",
		data: [{ x: threshold, y: threshold }],
		pointHitRadius: 50,
		dragData: true,
	}),
		(chart.data.labels = xValues));
		chart.update("none");
		document.getElementById("attackslider").value = attack;
		document.getElementById("attackdisplay").textContent = "Attack: " + attack + "ms";
		document.getElementById("ratioslider").value = ratio;
		document.getElementById("ratiodisplay").textContent = "Ratio: " + ratio + ":1";
		compressor.attack.setValueAtTime(attack / 1000, compressedcontext.currentTime);
		compressor.ratio.setValueAtTime(ratio, compressedcontext.currentTime);
		compressor.threshold.setValueAtTime(threshold, compressedcontext.currentTime);
		document.querySelectorAll(".text > ul > li")[1].textContent = "Threshold: " + threshold + "dB";
		document.querySelectorAll(".text > ul > li")[0].textContent = "Ratio: " + ratio + ":1";
		document.querySelectorAll(".text > ul > li")[2].textContent = "Attack: " + attack + "ms";
	});
	document.addEventListener("keydown", (e) => {
		if (e.code === "Enter" && ((soundplayed && !menu && !submitted) || modemode === 6)) submit();
	});
	document.getElementById("resetgainreduction").addEventListener("click", () => {
		maxgainreduction = Number.MAX_VALUE;
	});
	document.getElementById("import").addEventListener("click", () => {
		navigator.clipboard.writeText(` {
            ratio: ${ratio},
            attack: ${attack / 1000},
            threshold: ${Math.round(threshold / 10) * 10},
        },`);
	});
	document.getElementById("theme").addEventListener("click", () => {
		light = !light;
		if (light) {
			document.querySelector(":root").style.setProperty("--light1", "rgb(199, 199, 199)");
			document.querySelector(":root").style.setProperty("--light2", "rgb(223, 223, 223)");
			document.querySelector(":root").style.setProperty("--light3", "rgb(238, 238, 238)");
			document.getElementById("fader").style.backgroundColor = "white";
			document.body.style.color = "black";
			document.querySelectorAll("button").forEach((e) => {
				e.style.color = "black";
			});
		} else {
			document.querySelector(":root").style.setProperty("--light1", "rgb(61, 61, 61)");
			document.querySelector(":root").style.setProperty("--light2", "rgb(49, 49, 49)");
			document.querySelector(":root").style.setProperty("--light3", "rgb(26, 26, 26)");
			document.getElementById("fader").style.backgroundColor = "black";
			document.body.style.color = "white";
			document.querySelectorAll("button").forEach((e) => {
				e.style.color = "white";
			});
		}
	});
});
