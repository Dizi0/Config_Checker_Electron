// preload.js (toutes les sections: brut, safe, riches)
const { contextBridge } = require('electron');
const si = require('systeminformation');

contextBridge.exposeInMainWorld('systemAPI', {
    getSystem: async () => {
        const [system, baseboard, osInfo, battery, time] = await Promise.all([
            si.system(),
            si.baseboard(),
            si.osInfo(),
            si.battery(),
            si.time()
        ]);
        return {
            system: `${system.manufacturer} ${system.model}`,
            motherboard: `${baseboard.manufacturer} ${baseboard.model}`,
            os: osInfo.distro,
            battery: battery.hasbattery ? `${battery.percent}% (${battery.designedcapacity}${battery.capacityUnit})` : 'No battery detected',
            uptime: time.uptime,
            installDate: new Date(time.current - time.uptime * 1000).toLocaleString()
        };
    },

    getCPU: async () => {
        const [cpu, cpuTemp, cpuLoad] = await Promise.all([
            si.cpu(),
            si.cpuTemperature(),
            si.currentLoad()
        ]);
        return {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            speed: cpu.speed,
            physicalCores: cpu.physicalCores,
            cores: cpu.cores,
            temp: cpuTemp.main ?? null,
            load: cpuLoad.currentload ?? null
        };
    },

    getRAM: async () => {
        const [mem, memLayout] = await Promise.all([
            si.mem(),
            si.memLayout()
        ]);
        return {
            total: Math.round(mem.total / 1024 ** 3),
            used: Math.round((mem.total - mem.available) / 1024 ** 3),
            details: memLayout.map(r => ({
                manufacturer: r.manufacturer,
                size: r.size ? Math.round(r.size / 1024 ** 3) : null,
                type: r.type,
                clockSpeed: r.clockSpeed,
                formFactor: r.formFactor,
                serialNum: r.serialNum
            }))
        };
    },

    getGPU: async () => {
        const graphics = await si.graphics();
        return graphics.controllers.map(gpu => ({
            model: gpu.model,
            vendor: gpu.vendor,
            vram: gpu.vram,
            bus: gpu.bus
        }));
    },

    getDisks: async () => {
        const disks = await si.diskLayout();
        return disks.map(d => ({
            type: d.type,
            name: d.name,
            size: d.size ? Math.round(d.size / 1024 ** 3) : null,
            interfaceType: d.interfaceType,
            serialNum: d.serialNum,
            vendor: d.vendor
        }));
    },

    getNetwork: async () => {
        const interfaces = await si.networkInterfaces();
        return interfaces
            .filter(net => net.ip4 && !net.virtual)
            .map(n => n.ip4);
    }
});
