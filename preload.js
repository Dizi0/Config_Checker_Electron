// All of the Node.js APIs are available in the preload process.
const si = require('systeminformation');

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])
    }
})

si.system()
    .then(data =>{
            document.getElementById("system_model").innerText= data.manufacturer + ' ' + data.model
        }
    )
    .catch(error => console.error(error));

si.cpu()
    .then(data => {
        document.getElementById("cpu").innerText= data.manufacturer + ' ' + data.brand + ' ' + data.speed + 'GHz'
        si.baseboard()
            .then(data => {
                document.getElementById("motherboard").innerText=data.manufacturer + ' ' + data.model
            })
            .catch(error => console.error(error))
    })
si.mem()
    .then(data => {
        let ram =  data.total - data.swaptotal ;
        si.memLayout()
            .then(data => {
                let i = 0
                let totalram = 0
                data.forEach(ram => {
                    totalram = Number(String(ram.size).charAt(0)) + totalram
                    document.getElementById("totalram").innerText= totalram + " Gb"
                    document.getElementById("ram"+i).innerText= ram['manufacturer'] + ' of ' + ram.size.toString().charAt(0) + 'Gb'
                    i = ++i;
                });
            })
    })
    .catch(error => console.error(error))

si.battery()
    .then(data => {
        if (data.hasbattery != false){
            document.getElementById("battery_cap").innerText=  data.designedcapacity + data.capacityUnit
            document.getElementById("battery_percent").innerText=  data.percent + '%'
        }
        else {
            document.getElementById("battery_cap").innerText=  'No battery detected'
        }
    })
    .catch(error => console.error(error))

si.graphics()
    .then(data => {
        let gpus = data.controllers;
        let i = 0
        gpus.forEach(gpu => {
            document.getElementById("gpu"+i).innerText=  gpu['model'] + ' - ' + gpu['vram'].toString()[0] + ' Gb'
            ++i
        });
    })
    .catch(error => console.error(error))

si.osInfo()
    .then(data => {
        document.getElementById("system_os").innerText=  data.distro
    })
    .catch(error => console.error(error))

si.diskLayout()

    .then(data => {
        let i = 0
        data.forEach(disk => {
            let disksize = disk.size / Math.pow(1024, 3)
            document.getElementById("disk"+i ).innerText=  disk.type + ' -> ' + parseInt(disksize) + ' Gb ' + disk.name
            ++i;
        });
    })
    .catch(error => console.error(error))

