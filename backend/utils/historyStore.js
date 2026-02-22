const history = [];

function saveSnapshot(snapshot) {
  history.push({
    ...snapshot,
    timestamp: Date.now(),
  });
}

function getHistory() {
  return history.slice(-20); // last 20
}



module.exports = { saveSnapshot, getHistory };
