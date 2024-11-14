const TowersOfHanoi = () => {
	// State
	let stacks = [[], [], []];
	let moves = [];
	let legs = [];
	let legStartTime = 0;
	let timerID = 0;
	let baseTime = 0;
	
	// DOM Elements
	const status = document.getElementById('status');
	const container = document.getElementById('content') || createContainer();
	
	// Constants
	const POLE_CONFIG = {
	  midPoints: [150, 350, 550],
	  top: 200,
	  get bottom() { return this.top + 20 * 13; }
	};
	
	// Time tracking
	const getTime = () => {
	  const now = Date.now();
	  if (!baseTime) baseTime = now;
	  return (now - baseTime) / 1000;
	};
  
	const createContainer = () => {
	  const div = document.createElement('div');
	  div.id = 'content';
	  document.body.appendChild(div);
	  return div;
	};
  
	const createLeg = (element, { startX, startY, endX, endY, controlX, controlY, duration }) => ({
	  element,
	  startX,
	  startY,
	  endX,
	  endY,
	  controlX,
	  controlY,
	  duration
	});
  
	const animate = () => {
	  if (!legs.length) {
		nextMove();
		legStartTime = getTime();
	  }
	  
	  if (!legs.length) {
		stop();
		return;
	  }
  
	  const leg = legs[0];
	  const t = Math.min((getTime() - legStartTime) / leg.duration, 1.0);
  
	  // Quadratic Bezier curve calculation
	  const { startX, startY, controlX, controlY, endX, endY, element } = leg;
	  const oneMinusT = 1 - t;
	  const curX = startX * oneMinusT * oneMinusT + 2 * controlX * t * oneMinusT + endX * t * t;
	  const curY = startY * oneMinusT * oneMinusT + 2 * controlY * t * oneMinusT + endY * t * t;
  
	  element.style.left = `${Math.round(curX)}px`;
	  element.style.top = `${Math.round(curY)}px`;
  
	  if (t === 1.0) {
		legs.shift();
		legStartTime = getTime();
	  }
	};
  
	const nextMove = () => {
	  if (!moves.length) {
		status.textContent = 'Finished';
		return;
	  }
  
	  status.textContent = `${moves.length} moves remaining`;
  
	  const { from, to } = moves.shift();
	  const disk = stacks[from].pop();
	  stacks[to].push(disk);
  
	  const speed = parseFloat(document.getElementById('speed').value);
	  const pixelSpeed = 400.0 * speed;
	  const diskWidth = parseInt(disk.style.width);
	  const startX = parseInt(disk.style.left);
	  const startY = parseInt(disk.style.top);
  
	  // Calculate movement paths
	  const paths = [
		// Move up
		{
		  startX,
		  startY,
		  endX: POLE_CONFIG.midPoints[from] - diskWidth / 2,
		  endY: POLE_CONFIG.top,
		  controlX: startX,
		  controlY: startY + 20
		},
		// Move across
		{
		  startX: POLE_CONFIG.midPoints[from] - diskWidth / 2,
		  startY: POLE_CONFIG.top,
		  endX: (POLE_CONFIG.midPoints[from] + POLE_CONFIG.midPoints[to]) / 2 - diskWidth / 2,
		  endY: POLE_CONFIG.top - 100,
		  controlX: POLE_CONFIG.midPoints[from] - diskWidth / 2,
		  controlY: POLE_CONFIG.top - 100
		},
		// Move to destination
		{
		  startX: (POLE_CONFIG.midPoints[from] + POLE_CONFIG.midPoints[to]) / 2 - diskWidth / 2,
		  startY: POLE_CONFIG.top - 100,
		  endX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
		  endY: POLE_CONFIG.top,
		  controlX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
		  controlY: POLE_CONFIG.top - 100
		},
		// Move down
		{
		  startX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
		  startY: POLE_CONFIG.top,
		  endX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
		  endY: POLE_CONFIG.bottom - (stacks[to].length - 1) * 20 - 20, // Adjusted calculation
		  controlX: POLE_CONFIG.midPoints[to] - diskWidth / 2,
		  controlY: POLE_CONFIG.bottom - (stacks[to].length - 1) * 20 - 40 // Adjusted calculation
		}
	  ];
  
	  paths.forEach(path => {
		const duration = Math.abs(path.endY - path.controlY) / pixelSpeed / 2;
		legs.push(createLeg(disk, { ...path, duration }));
	  });
	};
  
	const moveStack = (n, from, to) => {
	  if (n <= 0) return;
	  
	  const other = 3 - (from + to);
	  moveStack(n - 1, from, other);
	  moves.push({ from, to });
	  moveStack(n - 1, other, to);
	};
  
	const createPole = (index) => {
	  const pole = document.createElement('img');
	  pole.src = 'disk.jpg';
	  Object.assign(pole.style, {
		position: 'absolute',
		width: '20px',
		height: `${POLE_CONFIG.bottom - POLE_CONFIG.top}px`,
		left: `${POLE_CONFIG.midPoints[index] - 10}px`,
		top: `${POLE_CONFIG.top}px`
	  });
	  container.appendChild(pole);
	};
  
	const createBase = () => {
	  const base = document.createElement('img');
	  base.src = 'disk.jpg';
	  Object.assign(base.style, {
		position: 'absolute',
		height: '20px',
		left: `${POLE_CONFIG.midPoints[0] - 100}px`,
		width: `${POLE_CONFIG.midPoints[2] - POLE_CONFIG.midPoints[0] + 200}px`,
		top: `${POLE_CONFIG.bottom}px`
	  });
	  container.appendChild(base);
	};
  
	const setupPoles = () => {
	  POLE_CONFIG.midPoints.forEach((_, index) => createPole(index));
	  createBase();
	};
  
	const createDisks = () => {
	  stacks.forEach(stack => {
		stack.forEach(disk => disk.remove());
	  });
	  
	  stacks = [[], [], []];
	  const nDisks = parseInt(document.getElementById('number').value);
	  let width = 190;
  
	  for (let i = 0; i < nDisks && width > 20; i++) {
		const disk = document.createElement('img');
		disk.src = 'disk.jpg';
		Object.assign(disk.style, {
		  position: 'absolute',
		  width: `${width}px`,
		  height: '19px',
		  left: `${Math.round(POLE_CONFIG.midPoints[0] - width / 2)}px`,
		  top: `${Math.round(POLE_CONFIG.bottom - (stacks[0].length + 1) * 20)}px` // Fixed initial positioning
		});
		container.appendChild(disk);
		stacks[0].push(disk);
		width -= 30;
	  }
	};
  
	// Public methods
	const start = () => {
	  if (!timerID) {
		timerID = setInterval(animate, 50);
		legStartTime += getTime();
	  }
	};
  
	const stop = () => {
	  if (timerID) {
		clearInterval(timerID);
		legStartTime -= getTime();
		timerID = 0;
	  }
	};
  
	const reset = () => {
	  moves = [];
	  legs = [];
	  legStartTime = 0;
	  createDisks();
	  moveStack(stacks[0].length, 0, 2);
	  status.textContent = '';
	};
  
	// Initialize
	setupPoles();
	reset();
  
	return {
	  start,
	  stop,
	  reset,
	  setNumber: reset,
	  setSpeed: () => {} // Speed is now handled dynamically in nextMove
	};
  };
  
  // Initialize the game
  const hanoi = TowersOfHanoi();