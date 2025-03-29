// renderer.js (copier CPU corrigé + tout à jour)
document.addEventListener('DOMContentLoaded', async () => {
    const el = id => document.getElementById(id);

    const showSpinner = id => {
        el(id).innerHTML = '<div class="spinner-border text-light" role="status"></div>';
    };

    const copyOnClick = (element, text) => {
        element.style.cursor = 'pointer';
        element.title = 'Cliquez pour copier';
        element.addEventListener('click', () => {
            navigator.clipboard.writeText(text);
        });
    };

    const formatParts = parts => parts.filter(Boolean).join(' - ');

    showSpinner('system_model');
    window.systemAPI.getSystem().then(data => {
        el('system_model').innerHTML = `💻 ${data.system}`;
        el('system_os').innerHTML = `🪟 ${data.os}`;
        el('motherboard').innerHTML = `🧩 ${data.motherboard}`;
        el('battery').innerHTML = `🔋 ${data.battery}`;
        el('uptime').innerText = formatUptime(data.uptime);
        el('install_date').innerText = data.installDate;
    }).catch(console.error);

    showSpinner('cpu_infos');
    window.systemAPI.getCPU().then(data => {
        const cpuContainer = el('cpu_infos');
        cpuContainer.innerHTML = '';
        const parts = [];
        if (data.manufacturer || data.brand) parts.push(`${data.manufacturer || ''} ${data.brand || ''}`.trim());
        if (data.speed) parts.push(`${data.speed} GHz`);
        if (data.physicalCores || data.cores) parts.push(`(${data.physicalCores || '?'} cores, ${data.cores || '?'} threads)`);
        const fullText = parts.join(' ');

        const cpuDiv = document.createElement('div');
        cpuDiv.className = 'data-item';
        cpuDiv.innerHTML = `⚙️ ${fullText}`;
        copyOnClick(cpuDiv, fullText);
        cpuContainer.appendChild(cpuDiv);

        const temp = (data.temp && parseFloat(data.temp) >= 0) ? `${data.temp}°C` : 'Non disponible';
        const tempDiv = document.createElement('div');
        tempDiv.className = 'data-item';
        tempDiv.innerHTML = `🌡️ Température: ${temp}`;
        cpuContainer.appendChild(tempDiv);

        const loadDiv = document.createElement('div');
        loadDiv.className = 'data-item';
        loadDiv.innerHTML = `⚡ Charge CPU: ${data.load ? data.load.toFixed(1) + '%' : 'Non disponible'}`;
        cpuContainer.appendChild(loadDiv);
    }).catch(console.error);

    showSpinner('ram_list');
    window.systemAPI.getRAM().then(data => {
        el('totalram').innerText = `${data.used} GB / ${data.total} GB`;
        const ramContainer = el('ram_list');
        ramContainer.innerHTML = '';
        data.details.forEach(ram => {
            const parts = [];
            if (ram.manufacturer && ram.manufacturer.toLowerCase() !== 'unknown') parts.push(ram.manufacturer);
            if (ram.size) parts.push(`${ram.size} GB`);

            const sub = [];
            if (ram.type && ram.type.toLowerCase() !== 'unknown') sub.push(ram.type);
            if (ram.clockSpeed) sub.push(`${ram.clockSpeed} MHz`);
            if (sub.length) parts.push(`(${sub.join(' - ')})`);

            if (ram.formFactor && ram.formFactor.toLowerCase() !== 'unknown') {
                parts.push(ram.formFactor);
            } else {
                parts.push('Onboard');
            }

            const label = formatParts(parts);
            const wrapper = document.createElement('div');
            wrapper.className = 'data-item';
            wrapper.innerHTML = `🧠 ${label}`;
            copyOnClick(wrapper, label);

            if (ram.serialNum && ram.serialNum !== '00000000') {
                wrapper.title = `Serial: ${ram.serialNum}`;
            }

            ramContainer.appendChild(wrapper);
        });
    }).catch(console.error);

    showSpinner('gpu_list');
    window.systemAPI.getGPU().then(gpus => {
        const gpuContainer = el('gpu_list');
        gpuContainer.innerHTML = '';
        gpus.forEach(gpu => {
            const parts = [];
            if (gpu.model && gpu.model.toLowerCase() !== 'unknown') parts.push(gpu.model);
            if (gpu.vendor && gpu.vendor.toLowerCase() !== 'unknown') parts.push(gpu.vendor);
            if (gpu.vram) parts.push(`${gpu.vram} MB VRAM`);
            if (gpu.bus && gpu.bus.toLowerCase() !== 'unknown') parts.push(`Bus: ${gpu.bus}`);
            const label = formatParts(parts);
            const wrapper = document.createElement('div');
            wrapper.className = 'data-item';
            wrapper.innerHTML = `🎮 ${label}`;
            copyOnClick(wrapper, label);
            gpuContainer.appendChild(wrapper);
        });
    }).catch(console.error);

    showSpinner('disk_list');
    window.systemAPI.getDisks().then(disks => {
        const diskContainer = el('disk_list');
        diskContainer.innerHTML = '';
        disks.forEach(disk => {
            const parts = [];
            if (disk.type && disk.type.toLowerCase() !== 'unknown') parts.push(disk.type);
            if (disk.size) parts.push(`${disk.size} GB`);
            if (disk.name && disk.name.toLowerCase() !== 'unknown') parts.push(disk.name);
            if (disk.vendor && disk.vendor.toLowerCase() !== 'unknown') parts.push(disk.vendor);
            if (disk.interfaceType && disk.interfaceType.toLowerCase() !== 'unknown') parts.push(`Interface: ${disk.interfaceType}`);
            const label = formatParts(parts);

            const wrapper = document.createElement('div');
            wrapper.className = 'data-item';
            wrapper.innerHTML = `💾 ${label}`;
            copyOnClick(wrapper, label);
            if (disk.serialNum) wrapper.title = `Serial: ${disk.serialNum}`;
            diskContainer.appendChild(wrapper);
        });
    }).catch(console.error);

    showSpinner('ip_addresses');
    window.systemAPI.getNetwork().then(ips => {
        const ipContainer = el('ip_addresses');
        ipContainer.innerHTML = '';
        ips.forEach(ip => {
            const div = document.createElement('div');
            div.className = 'blurred-ip data-item';
            div.innerHTML = '🌐 ' + maskIp(ip);
            div.dataset.real = ip;
            div.title = `Cliquez pour afficher et copier l'IP`;
            div.addEventListener('click', function () {
                this.classList.remove('blurred-ip');
                this.innerText = '🌐 ' + this.dataset.real;
                navigator.clipboard.writeText(this.dataset.real);
            });
            ipContainer.appendChild(div);
        });
    }).catch(console.error);

    // Export bouton
    document.getElementById('exportBtn').addEventListener('click', async () => {
        const [system, cpu, ram, gpu, disks, ip] = await Promise.all([
            window.systemAPI.getSystem(),
            window.systemAPI.getCPU(),
            window.systemAPI.getRAM(),
            window.systemAPI.getGPU(),
            window.systemAPI.getDisks(),
            window.systemAPI.getNetwork()
        ]);

        const exportData = { ...system, cpu, ram, gpu, disks, ip };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'system_info.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    document.getElementById('loading-spinner').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
});

function maskIp(ip) {
    const parts = ip.split('.');
    return `${parts[0]}.***.***.${parts[3]}`;
}

function formatUptime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}min`;
}
