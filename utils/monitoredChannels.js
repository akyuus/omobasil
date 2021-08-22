const fs = require('fs');
const path = require('path');
const monitoredChannelsPath = path.join(__dirname, 'monitoredChannels.json');
let monitoredChannels = JSON.parse(fs.readFileSync(monitoredChannelsPath, { encoding: 'utf-8' }));

const getMonitoredChannels = () => {
  return monitoredChannels;
}

const updateMonitoredChannels = (id) => {
  if(monitoredChannels.includes(id)) {
    monitoredChannels = monitoredChannels.filter(channelId => channelId !== id);
  }
  else {
    monitoredChannels.push(id);
  }
  fs.writeFileSync(monitoredChannelsPath, JSON.stringify(monitoredChannels));
  return monitoredChannels;
}

module.exports = {
  getMonitoredChannels,
  updateMonitoredChannels
}
