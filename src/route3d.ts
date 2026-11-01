// 3D Motorcycle Route Visualization (98 KM Surabaya <-> Malang via Jalur Bawah / Non-Tol)
// High-accuracy 3D Diorama with realistic East Java geography, elevation profile, and landmarks
// Built with Three.js conforming to threejs skill guidelines
import * as THREE from 'three';

export interface RouteWaypointInfo {
    id: 'surabaya' | 'sidoarjo' | 'pandaan' | 'purwodadi' | 'lawang' | 'malang';
    name: string;
    km: number;
    badge: string;
    story: string;
    pos: THREE.Vector3;
    rotX: number;
    rotY: number;
    zoom: number;
}

export const ROUTE_WAYPOINTS: Record<string, RouteWaypointInfo> = {
    surabaya: {
        id: 'surabaya',
        name: 'Surabaya (Kacong Ban)',
        km: 0,
        badge: 'KM 0 • Berangkat dari Surabaya',
        story: 'Manasin motor dari Kacong Ban Surabaya Utara, ngecek bensin & helm sambil ngabarin kamu: "aku otw ya bubby".',
        pos: new THREE.Vector3(-1.3, 0.08, -4.2),
        rotX: 0.52,
        rotY: 0.15,
        zoom: 7.5
    },
    sidoarjo: {
        id: 'sidoarjo',
        name: 'Sidoarjo (Alun-Alun & Arteri)',
        km: 26,
        badge: 'KM 26 • Menyusuri Sidoarjo',
        story: 'Nembus jalanan arteri Sidoarjo yang ramai. Panas terik siang hari nempel di jaket, tapi pikiran tetap ke kamu.',
        pos: new THREE.Vector3(-0.6, 0.11, -1.8),
        rotX: 0.55,
        rotY: 0.28,
        zoom: 8.0
    },
    pandaan: {
        id: 'pandaan',
        name: 'Pandaan (Kaki Penanggungan)',
        km: 52,
        badge: 'KM 52 • Angin Sejuk Pandaan',
        story: 'Jalanan Pandaan di kaki Gunung Penanggungan. Angin jalanan mulai kerasa adem semilir sejuk pas naik motor.',
        pos: new THREE.Vector3(0.2, 0.25, 0.4),
        rotX: 0.56,
        rotY: 0.45,
        zoom: 8.0
    },
    purwodadi: {
        id: 'purwodadi',
        name: 'Purwodadi (Kebun Raya)',
        km: 68,
        badge: 'KM 68 • Istirahat di Purwodadi',
        story: 'Spot favorit neduh di pinggir jalan rimbun depan Kebun Raya. Lepas sarung tangan motor sambil minum es teh & telponan.',
        pos: new THREE.Vector3(0.38, 0.35, 1.4),
        rotX: 0.58,
        rotY: 0.65,
        zoom: 8.0
    },
    lawang: {
        id: 'lawang',
        name: 'Puncak Lawang Pass',
        km: 82,
        badge: 'KM 82 • Dinginnya Tanjakan Lawang',
        story: 'Puncak tanjakan Lawang! Angin dingin pegunungan nembus jaket motor, tanda rumahmu udah tinggal sejengkal lagi.',
        pos: new THREE.Vector3(0.36, 0.48, 2.7),
        rotX: 0.52,
        rotY: 0.85,
        zoom: 8.0
    },
    malang: {
        id: 'malang',
        name: 'Malang (Rumah Bubby)',
        km: 98,
        badge: 'KM 98 • Sampai di Rumah Bubby',
        story: 'Motor sampai dan diparkir di depan rumah My Pretty girl. Perjalanan 98 km lunas terbayar pas lihat senyum manjamu.',
        pos: new THREE.Vector3(-0.25, 0.28, 4.3),
        rotX: 0.54,
        rotY: 1.10,
        zoom: 7.5
    }
};

export class Route3DController {
    private container: HTMLElement | null = null;
    private canvas: HTMLCanvasElement | null = null;
    private scene: THREE.Scene | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private renderer: THREE.WebGLRenderer | null = null;
    private curve: THREE.CatmullRomCurve3 | null = null;
    private pulseMesh: THREE.Mesh | null = null;
    private travelingMotor: THREE.Group | null = null;
    private animFrameId: number | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private resizeRafId: number | null = null;
    private lastWidth = 0;
    private lastHeight = 0;

    // Interactive Raycaster for tapping 3D pins
    private raycaster = new THREE.Raycaster();
    private mouseVector = new THREE.Vector2();
    private clickablePins: { mesh: THREE.Object3D; id: 'surabaya' | 'sidoarjo' | 'pandaan' | 'purwodadi' | 'lawang' | 'malang' }[] = [];

    public isActive = false;
    public trackingMode: 'follow' | 'orbit' = 'orbit';

    // Camera states with responsive defaults
    private isDragging = false;
    private pointerStartX = 0;
    private pointerStartY = 0;
    private previousMouseX = 0;
    private previousMouseY = 0;
    private targetRotX = 0.55;
    private targetRotY = 0.35;
    private currentRotX = 0.55;
    private currentRotY = 0.35;
    private targetZoom = 11.5;
    private currentZoom = 11.5;
    private mouseParallaxX = 0;
    private mouseParallaxY = 0;

    // Progress along the 98 km route (0 to 1)
    private routeProgress = 0;
    private lastTime = performance.now();
    private lastInteractionTime = performance.now();

    // Direct mobile touch and pinch state
    public isTouchLocked = false;
    private isPinching = false;
    private initialPinchDist = 0;
    private initialPinchZoom = 11.5;

    public setTouchLock(_locked: boolean): void {
        this.isTouchLocked = false;
        const unlockBtn = document.getElementById('map-touch-unlock-btn');
        const doneBtn = document.getElementById('map-touch-done-btn');
        const hintEl = document.getElementById('map-touch-active-hint');
        if (unlockBtn) unlockBtn.style.display = 'none';
        if (doneBtn) doneBtn.style.display = 'none';
        if (hintEl) hintEl.style.display = 'none';
        this.isDragging = false;
        this.isPinching = false;
    }

    public init(containerId: string): void {
        const el = document.getElementById(containerId);
        if (!el) return;
        this.container = el;

        if (!this.checkWebGL()) {
            this.renderFallback();
            return;
        }

        this.initScene();
        this.initDiorama();
        this.initRoute();
        this.initControls();

        this.resizeObserver = new ResizeObserver(() => {
            if (this.resizeRafId !== null) {
                cancelAnimationFrame(this.resizeRafId);
            }
            this.resizeRafId = requestAnimationFrame(() => {
                this.resizeRafId = null;
                this.onResize();
            });
        });
        this.resizeObserver.observe(this.container);
        this.onResize();
    }

    private checkWebGL(): boolean {
        try {
            const canvas = document.createElement('canvas');
            const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
            return Boolean(gl);
        } catch {
            return false;
        }
    }

    private renderFallback(): void {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full p-3 text-center font-mono text-amber-900">
                <span class="text-xl mb-1">🛵</span>
                <p class="text-xs font-bold uppercase mb-0.5">Rute Motor 98 KM: Surabaya ↔ Malang</p>
                <p class="text-[8px] text-gray-600 mb-2">Jalur arteri bawah Surabaya - Pandaan - Lawang - Malang.</p>
                <a href="https://maps.app.goo.gl/KKxektnuGK1EkQWWA" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 bg-red-950 text-amber-200 rounded text-[8px] font-bold uppercase shadow">
                    Buka Rute di Google Maps ↗
                </a>
            </div>
        `;
    }

    private initScene(): void {
        if (!this.container) return;
        const width = this.container.clientWidth || 340;
        const height = this.container.clientHeight || 220;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf6f0e2); // Warm vintage parchment tone

        const isMobile = window.innerWidth < 640;
        this.camera = new THREE.PerspectiveCamera(isMobile ? 44 : 40, width / height, 0.1, 100);
        this.camera.position.set(0, 9, 9);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.canvas = this.renderer.domElement;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.display = 'block';
        this.canvas.style.touchAction = 'none';
        this.container.appendChild(this.canvas);

        // Nocturnal retro lighting with warm gold illumination
        const ambient = new THREE.AmbientLight(0xdcfce7, 0.95);
        this.scene.add(ambient);

        const dirLight = new THREE.DirectionalLight(0xfef08a, 2.2);
        dirLight.position.set(7, 15, 8);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 35;
        dirLight.shadow.camera.left = -7;
        dirLight.shadow.camera.right = 7;
        dirLight.shadow.camera.top = 7;
        dirLight.shadow.camera.bottom = -7;
        this.scene.add(dirLight);

        const fillLight = new THREE.PointLight(0xf59e0b, 1.4, 18);
        fillLight.position.set(-6, 5, -3);
        this.scene.add(fillLight);
    }

    private createRetroDarkTexture(): THREE.CanvasTexture {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 1024;
        const ctx = c.getContext('2d');
        if (ctx) {
            // 1. Deep Forest Green Nocturnal Terrain Base
            ctx.fillStyle = '#0d1c10';
            ctx.fillRect(0, 0, 1024, 1024);

            // 2. High-Altitude Terrain Gradient (Deepening into elevated mountain basin)
            const terrainGrad = ctx.createLinearGradient(0, 0, 0, 1024);
            terrainGrad.addColorStop(0, '#0c1a0f');    // North (coastal Surabaya plain)
            terrainGrad.addColorStop(0.35, '#132816'); // Sidoarjo / Gempol lowlands
            terrainGrad.addColorStop(0.7, '#1b361e');  // Foothills of Arjuno / Welirang
            terrainGrad.addColorStop(1.0, '#234427');  // Malang elevated plateau
            ctx.fillStyle = terrainGrad;
            ctx.fillRect(0, 0, 1024, 1024);

            // 3. Selat Madura Coastal Waters (Deep Midnight Indigo)
            const oceanGrad = ctx.createRadialGradient(900, 80, 20, 880, 100, 360);
            oceanGrad.addColorStop(0, '#09131d');
            oceanGrad.addColorStop(0.65, '#0e1d2c');
            oceanGrad.addColorStop(0.9, '#13273a');
            oceanGrad.addColorStop(1, 'rgba(13, 28, 16, 0)');
            ctx.fillStyle = oceanGrad;
            ctx.fillRect(520, 0, 504, 340);

            // Coastline shimmer in warm antique gold
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.28)';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(560, 0);
            ctx.bezierCurveTo(620, 120, 720, 200, 1024, 250);
            ctx.stroke();

            // 4. Brantas & Porong River Delta (Deep Night Sapphire)
            ctx.strokeStyle = '#0e2334';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(340, 680);
            ctx.bezierCurveTo(460, 520, 480, 380, 560, 290);
            ctx.bezierCurveTo(620, 240, 720, 220, 840, 180);
            ctx.stroke();

            // 5. Agricultural Mosaic (Lush Forest Patches & Tea Plantations)
            const greens = ['#142717', '#1a321d', '#203b23', '#172b1a', '#264629'];
            for (let i = 0; i < 75; i++) {
                const rx = 180 + Math.random() * 560;
                const ry = 150 + Math.random() * 700;
                const rw = 25 + Math.random() * 55;
                const rh = 20 + Math.random() * 45;
                ctx.fillStyle = greens[i % greens.length];
                ctx.fillRect(rx, ry, rw, rh);
                ctx.strokeStyle = 'rgba(10, 20, 12, 0.45)';
                ctx.lineWidth = 0.8;
                ctx.strokeRect(rx, ry, rw, rh);
            }

            // 6. Volcanic Ridge Mountain Massifs (Gunung Arjuno, Welirang, Penanggungan)
            const arjunoGrad = ctx.createRadialGradient(760, 720, 40, 760, 720, 240);
            arjunoGrad.addColorStop(0, '#151e16');
            arjunoGrad.addColorStop(0.5, '#19281a');
            arjunoGrad.addColorStop(1, 'rgba(13, 28, 16, 0)');
            ctx.fillStyle = arjunoGrad;
            ctx.beginPath();
            ctx.arc(760, 720, 240, 0, Math.PI * 2);
            ctx.fill();

            const penGrad = ctx.createRadialGradient(720, 480, 20, 720, 480, 140);
            penGrad.addColorStop(0, '#182419');
            penGrad.addColorStop(0.6, '#1a2b1c');
            penGrad.addColorStop(1, 'rgba(13, 28, 16, 0)');
            ctx.fillStyle = penGrad;
            ctx.beginPath();
            ctx.arc(720, 480, 140, 0, Math.PI * 2);
            ctx.fill();

            // 7. Topographical Contour Curves in High-Contrast Warm Antique Gold
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
            ctx.lineWidth = 1.4;
            for (let r = 50; r < 360; r += 45) {
                ctx.beginPath();
                ctx.ellipse(750, 710, r * 1.1, r * 0.9, Math.PI / 6, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (let r = 35; r < 180; r += 35) {
                ctx.beginPath();
                ctx.arc(720, 480, r, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Subtle Antique Coordinate Grid
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
            ctx.lineWidth = 0.8;
            for (let i = 128; i < 1024; i += 128) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 1024);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(1024, i);
                ctx.stroke();
            }

            // 8. Stamped Compass Rose (Warm Antique Gold)
            ctx.save();
            ctx.translate(130, 130);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 48, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 15px serif';
            ctx.textAlign = 'center';
            ctx.fillText('U', 0, -26);
            ctx.fillText('S', 0, 38);
            ctx.font = 'bold 11px serif';
            ctx.fillText('98 KM', 0, 4);
            ctx.restore();

            // 9. Romantic Humanized Manifestation Labels (Antique Gold Leaf Style)
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 18px "Playfair Display", Georgia, serif';
            ctx.fillText('98 KILOMETER MENEMUI BUBBY', 220, 960);
            ctx.font = 'italic 12px "EB Garamond", Georgia, serif';
            ctx.fillStyle = '#fde047';
            ctx.fillText('Surabaya ↔ Malang • Mengendarai motor menembus jarak demi pelukanmu', 220, 985);
            ctx.font = '11px monospace';
            ctx.fillStyle = '#cbd5e1';
            ctx.fillText('Kacong Ban -> Sidoarjo -> Pandaan -> Purwodadi -> Lawang -> Malang', 220, 1005);

            // City Markers in Warm Gold
            ctx.font = 'bold 15px "Playfair Display", Georgia, serif';
            ctx.fillStyle = '#fde047';
            ctx.fillText('✦ SURABAYA (NAUFAL)', 75, 75);
            ctx.fillText('♥ MALANG (BUBBY)', 160, 900);
        }

        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        return tex;
    }

    private initDiorama(): void {
        if (!this.scene) return;

        // Diorama Base Board (Antique Dark Mahogany Leather/Wood Finish)
        const boardGeo = new THREE.BoxGeometry(8.5, 0.45, 11);
        const mapTexture = this.createRetroDarkTexture();

        const boardMatTop = new THREE.MeshStandardMaterial({
            map: mapTexture,
            roughness: 0.65,
            metalness: 0.15
        });

        const boardMatSide = new THREE.MeshStandardMaterial({
            color: 0x1c130d, // Dark antique mahogany
            roughness: 0.45,
            metalness: 0.35
        });

        const materials = [
            boardMatSide, boardMatSide,
            boardMatTop, boardMatSide,
            boardMatSide, boardMatSide
        ];

        const boardMesh = new THREE.Mesh(boardGeo, materials);
        boardMesh.position.y = -0.25;
        boardMesh.receiveShadow = true;
        this.scene.add(boardMesh);

        // 1. Gunung Arjuno (3,339 mdpl) - Realistic Volcanic Satellite Rock
        const arjunoGeo = new THREE.ConeGeometry(2.0, 3.0, 9);
        const arjunoMat = new THREE.MeshStandardMaterial({
            color: 0x283226,
            roughness: 0.85,
            flatShading: true
        });
        const arjuno = new THREE.Mesh(arjunoGeo, arjunoMat);
        arjuno.position.set(2.4, 1.25, 2.0);
        arjuno.castShadow = true;
        arjuno.receiveShadow = true;
        this.scene.add(arjuno);

        // Misty Cloud Cap on Gunung Arjuno
        const cloudCapGeo = new THREE.ConeGeometry(0.7, 0.9, 9);
        const cloudCapMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35, transparent: true, opacity: 0.85 });
        const cloudCap = new THREE.Mesh(cloudCapGeo, cloudCapMat);
        cloudCap.position.set(2.4, 2.3, 2.0);
        this.scene.add(cloudCap);

        // 2. Gunung Welirang (3,156 mdpl)
        const welirangGeo = new THREE.ConeGeometry(1.4, 2.0, 7);
        const welirangMat = new THREE.MeshStandardMaterial({
            color: 0x333b30,
            roughness: 0.85,
            flatShading: true
        });
        const welirang = new THREE.Mesh(welirangGeo, welirangMat);
        welirang.position.set(3.0, 0.75, 1.1);
        welirang.castShadow = true;
        welirang.receiveShadow = true;
        this.scene.add(welirang);

        // 3. Gunung Penanggungan (1,653 mdpl di samping jalur Pandaan)
        const penanggunganGeo = new THREE.ConeGeometry(1.3, 1.9, 8);
        const penanggunganMat = new THREE.MeshStandardMaterial({
            color: 0x222c1e,
            roughness: 0.85,
            flatShading: true
        });
        const penanggungan = new THREE.Mesh(penanggunganGeo, penanggunganMat);
        penanggungan.position.set(2.0, 0.7, -0.1);
        penanggungan.castShadow = true;
        this.scene.add(penanggungan);

        // Procedural trees along the non-toll mountain pass (Pandaan, Purwodadi, Lawang)
        const treePositions = [
            [1.1, 0.28, 0.7], [1.4, 0.35, 1.3], [1.0, 0.38, 1.8],
            [1.3, 0.45, 2.3], [0.9, 0.46, 2.7], [0.7, 0.35, 3.2],
            [-0.7, 0.32, 3.8], [1.7, 0.25, 0.2], [1.5, 0.32, 0.9],
            [0.1, 0.34, 1.5]
        ];
        const treeMat = new THREE.MeshStandardMaterial({ color: 0x143014, roughness: 0.85, flatShading: true });
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2e1e12 });

        for (const [tx, ty, tz] of treePositions) {
            const treeGroup = new THREE.Group();
            const foliage = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 5), treeMat);
            foliage.position.y = 0.25;
            foliage.castShadow = true;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 5), trunkMat);
            trunk.position.y = 0.075;
            treeGroup.add(trunk);
            treeGroup.add(foliage);
            treeGroup.position.set(tx, ty, tz);
            this.scene.add(treeGroup);
        }

        // Landmark: Surabaya Tugu Pahlawan Obelisk
        const tuguGroup = new THREE.Group();
        const tuguBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.12, 8), new THREE.MeshStandardMaterial({ color: 0x64748b }));
        const tuguSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 }));
        tuguSpire.position.y = 0.4;
        tuguGroup.add(tuguBase);
        tuguGroup.add(tuguSpire);
        tuguGroup.position.set(-1.8, 0.1, -4.2);
        this.scene.add(tuguGroup);

        // Landmark: Purwodadi Botanical Resting Spot
        const restStopGroup = new THREE.Group();
        const shelterRoof = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.15, 4), new THREE.MeshStandardMaterial({ color: 0x059669 }));
        shelterRoof.position.y = 0.22;
        shelterRoof.rotation.y = Math.PI / 4;
        const shelterPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), new THREE.MeshStandardMaterial({ color: 0x334155 }));
        shelterPillar.position.y = 0.1;
        restStopGroup.add(shelterRoof);
        restStopGroup.add(shelterPillar);
        restStopGroup.position.set(0.65, 0.35, 1.4);
        this.scene.add(restStopGroup);

        // Landmark: Malang Heart / Crown Monument
        const malangCrownGroup = new THREE.Group();
        const crownMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
        const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.1, 12), crownMat);
        malangCrownGroup.add(crownBase);
        malangCrownGroup.position.set(-0.7, 0.3, 4.3);
        this.scene.add(malangCrownGroup);
    }

    private initRoute(): void {
        if (!this.scene) return;

        // 12 Waypoints following the actual non-toll national artery road for motorcycles:
        // Kacong Ban (Surabaya Utara) -> Darmo/Wonokromo -> Sidoarjo Alun-Alun -> Porong -> Arteri Gempol -> Pandaan Kasri -> Purwosari -> Purwodadi -> Lawang -> Singosari -> Malang
        const waypoints = [
            new THREE.Vector3(-1.3, 0.08, -4.2),  // 0: Surabaya Utara / Kacong Ban (KM 0)
            new THREE.Vector3(-1.05, 0.09, -3.3), // 1: Wonokromo & Batas Kota (KM 8)
            new THREE.Vector3(-0.8, 0.10, -2.4),  // 2: Waru Arteri / Sidoarjo Utara (KM 18)
            new THREE.Vector3(-0.6, 0.11, -1.8),  // 3: Sidoarjo Alun-Alun (KM 26)
            new THREE.Vector3(-0.35, 0.14, -1.0), // 4: Porong Arteri Raya (KM 38)
            new THREE.Vector3(-0.05, 0.18, -0.3), // 5: Kejapanan / Gempol (KM 46)
            new THREE.Vector3(0.2, 0.25, 0.4),    // 6: Jalan Raya Pandaan (KM 52)
            new THREE.Vector3(0.38, 0.35, 1.4),   // 7: Purwodadi Kebun Raya (KM 68)
            new THREE.Vector3(0.42, 0.40, 1.9),   // 8: Purwosari Lereng Arjuno (KM 74)
            new THREE.Vector3(0.36, 0.48, 2.7),   // 9: Puncak Lawang Pass (500 mdpl) (KM 82)
            new THREE.Vector3(0.12, 0.36, 3.4),   // 10: Singosari Arteri (KM 90)
            new THREE.Vector3(-0.25, 0.28, 4.3)   // 11: Kota Malang (Dinoyo / Suhat) (KM 98)
        ];

        this.curve = new THREE.CatmullRomCurve3(waypoints, false, 'catmullrom', 0.25);

        // High-contrast glowing warm gold route line (98 KM)
        const tubeGeo = new THREE.TubeGeometry(this.curve, 120, 0.07, 10, false);
        const tubeMat = new THREE.MeshStandardMaterial({
            color: 0xf59e0b,
            roughness: 0.25,
            metalness: 0.8,
            emissive: 0xd97706,
            emissiveIntensity: 0.75
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.castShadow = true;
        this.scene.add(tubeMesh);

        // Glowing center pulse indicator
        const pulseGeo = new THREE.SphereGeometry(0.13, 16, 16);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        this.pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        this.scene.add(this.pulseMesh);

        // 3D Motorcycle Keepsake Vehicle
        this.travelingMotor = this.createMotorcycleMarker();
        this.scene.add(this.travelingMotor);

        // Register interactive pins for key milestones along the motorcycle route
        this.clickablePins = [];

        this.createInteractivePin(ROUTE_WAYPOINTS.surabaya, 0x1e3a8a, '🏠');
        this.createInteractivePin(ROUTE_WAYPOINTS.sidoarjo, 0x475569, '🛵');
        this.createInteractivePin(ROUTE_WAYPOINTS.pandaan, 0x059669, '🌿');
        this.createInteractivePin(ROUTE_WAYPOINTS.purwodadi, 0xd97706, '☕');
        this.createInteractivePin(ROUTE_WAYPOINTS.lawang, 0x7c3aed, '⛰️');
        this.createInteractivePin(ROUTE_WAYPOINTS.malang, 0xb45309, '👑');
    }

    private createMotorcycleMarker(): THREE.Group {
        const group = new THREE.Group();

        // Two miniature black wheels
        const wheelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.8 });
        wheelGeo.rotateZ(Math.PI / 2);

        const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
        frontWheel.position.set(0, 0.08, 0.16);
        group.add(frontWheel);

        const rearWheel = new THREE.Mesh(wheelGeo, wheelMat);
        rearWheel.position.set(0, 0.08, -0.16);
        group.add(rearWheel);

        // Motor frame chassis (Ruby crimson color)
        const bodyGeo = new THREE.BoxGeometry(0.09, 0.1, 0.32);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, metalness: 0.5, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.set(0, 0.14, 0);
        group.add(body);

        // Handlebars
        const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8);
        barGeo.rotateZ(Math.PI / 2);
        const barMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 });
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, 0.22, 0.14);
        group.add(bar);

        // Heart-shaped rider beacon on the seat
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo(x + 0.1, y + 0.1);
        heartShape.bezierCurveTo(x + 0.1, y + 0.1, x + 0.08, y, x, y);
        heartShape.bezierCurveTo(x - 0.12, y, x - 0.12, y + 0.14, x - 0.12, y + 0.14);
        heartShape.bezierCurveTo(x - 0.12, y + 0.22, x - 0.04, y + 0.3, x + 0.1, y + 0.38);
        heartShape.bezierCurveTo(x + 0.24, y + 0.3, x + 0.32, y + 0.22, x + 0.32, y + 0.14);
        heartShape.bezierCurveTo(x + 0.32, y + 0.14, x + 0.32, y, x + 0.2, y);
        heartShape.bezierCurveTo(x + 0.14, y, x + 0.1, y + 0.1, x + 0.1, y + 0.1);

        const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.06, bevelEnabled: false });
        heartGeo.center();
        const heartMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, emissive: 0x9f1239, roughness: 0.3 });
        const heartRider = new THREE.Mesh(heartGeo, heartMat);
        heartRider.rotation.x = Math.PI;
        heartRider.rotation.z = Math.PI;
        heartRider.scale.set(0.65, 0.65, 0.65);
        heartRider.position.set(0, 0.32, -0.04);
        group.add(heartRider);

        // Headlight beam projecting ahead on the road
        const light = new THREE.PointLight(0xffedd5, 1.6, 3.0);
        light.position.set(0, 0.2, 0.25);
        group.add(light);

        return group;
    }

    private createInteractivePin(wp: RouteWaypointInfo, color: number, emoji: string): void {
        if (!this.scene) return;

        const pinGroup = new THREE.Group();
        pinGroup.position.copy(wp.pos);

        // Brass Shaft
        const shaftGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.7, 10);
        const shaftMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.y = 0.35;
        shaft.castShadow = true;
        pinGroup.add(shaft);

        // Gem Head
        const headGeo = new THREE.SphereGeometry(0.18, 14, 14);
        const headMat = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.4,
            roughness: 0.2,
            emissive: color,
            emissiveIntensity: 0.4
        });
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.7;
        head.castShadow = true;
        pinGroup.add(head);

        // Base ring
        const ringGeo = new THREE.RingGeometry(0.14, 0.25, 20);
        const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.02;
        pinGroup.add(ring);

        // Label Canvas Sprite
        const sprite = this.createLabelSprite(`${emoji} ${wp.name}`);
        sprite.position.set(0, 1.2, 0);
        pinGroup.add(sprite);

        // Generous invisible hit sphere for effortless touch and click accuracy on mobile
        const hitSphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.65, 8, 8),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        hitSphere.position.y = 0.7;
        pinGroup.add(hitSphere);

        this.scene.add(pinGroup);

        this.clickablePins.push({ mesh: hitSphere, id: wp.id });
    }

    private createLabelSprite(text: string): THREE.Sprite {
        const c = document.createElement('canvas');
        c.width = 280;
        c.height = 64;
        const ctx = c.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'rgba(254, 252, 247, 0.94)';
            ctx.strokeStyle = '#4a2c17';
            ctx.lineWidth = 2.5;

            const r = 8;
            ctx.beginPath();
            ctx.moveTo(r, 6);
            ctx.lineTo(280 - r, 6);
            ctx.quadraticCurveTo(280, 6, 280, 6 + r);
            ctx.lineTo(280, 58 - r);
            ctx.quadraticCurveTo(280, 58, 280 - r, 58);
            ctx.lineTo(r, 58);
            ctx.quadraticCurveTo(0, 58, 0, 58 - r);
            ctx.lineTo(0, 6 + r);
            ctx.quadraticCurveTo(0, 6, r, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#1c1917';
            ctx.font = 'bold 17px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 140, 32);
        }

        const tex = new THREE.CanvasTexture(c);
        const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(1.4, 0.34, 1);
        return sprite;
    }

    private initControls(): void {
        if (!this.canvas) return;

        const onDown = (clientX: number, clientY: number) => {
            this.setTrackingMode('orbit');
            this.isDragging = true;
            this.lastInteractionTime = performance.now();
            this.pointerStartX = clientX;
            this.pointerStartY = clientY;
            this.previousMouseX = clientX;
            this.previousMouseY = clientY;
        };

        const onMove = (clientX: number, clientY: number) => {
            if (!this.container) return;
            const rect = this.container.getBoundingClientRect();
            this.mouseParallaxX = ((clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 0.15;
            this.mouseParallaxY = ((clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 0.12;

            if (!this.isDragging) return;
            this.lastInteractionTime = performance.now();

            const deltaX = clientX - this.previousMouseX;
            const deltaY = clientY - this.previousMouseY;
            this.previousMouseX = clientX;
            this.previousMouseY = clientY;

            // Fluid and calibrated rotation sensitivity for both mobile and desktop
            this.targetRotY += deltaX * 0.005;
            this.targetRotX += deltaY * 0.0038;
            this.targetRotX = Math.max(0.12, Math.min(1.25, this.targetRotX));
        };

        const onUp = (clientX: number, clientY: number) => {
            if (this.isDragging) {
                const dist = Math.hypot(clientX - this.pointerStartX, clientY - this.pointerStartY);
                if (dist < 10) {
                    this.handleCanvasClick(clientX, clientY);
                }
            }
            this.isDragging = false;
            this.isPinching = false;
            this.lastInteractionTime = performance.now();
        };

        // Desktop mouse event listeners (smooth orbit & zoom, stops propagation)
        this.canvas.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            onDown(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', (e) => onUp(e.clientX, e.clientY));

        // Mobile touch listeners (smooth orbit & pinch-to-zoom)
        this.canvas.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            this.lastInteractionTime = performance.now();

            if (e.touches.length === 1) {
                this.isPinching = false;
                onDown(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2) {
                this.isPinching = true;
                this.isDragging = false;
                this.initialPinchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                this.initialPinchZoom = this.targetZoom;
            }
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (!this.isDragging && !this.isPinching) return;
            if (e.cancelable) e.preventDefault();
            this.lastInteractionTime = performance.now();

            if (e.touches.length === 1 && !this.isPinching) {
                onMove(e.touches[0].clientX, e.touches[0].clientY);
            } else if (e.touches.length === 2 && this.isPinching) {
                const currentDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                if (this.initialPinchDist > 0 && currentDist > 10) {
                    const factor = this.initialPinchDist / currentDist;
                    this.targetZoom = Math.max(6.0, Math.min(16.0, this.initialPinchZoom * factor));
                }
            }
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (!this.isDragging && !this.isPinching) return;
            if (e.touches.length < 2) {
                this.isPinching = false;
            }
            if (e.changedTouches.length > 0) {
                onUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            } else {
                this.isDragging = false;
            }
        });

        // Wheel zoom (Desktop)
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.lastInteractionTime = performance.now();
            this.targetZoom += e.deltaY * 0.005;
            this.targetZoom = Math.max(6.0, Math.min(16.0, this.targetZoom));
        }, { passive: false });
    }

    private handleCanvasClick(clientX: number, clientY: number): void {
        if (!this.container || !this.camera || this.clickablePins.length === 0) return;
        const rect = this.container.getBoundingClientRect();
        this.mouseVector.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.mouseVector.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouseVector, this.camera);
        const meshes = this.clickablePins.map(p => p.mesh);
        const intersects = this.raycaster.intersectObjects(meshes, true);

        if (intersects.length > 0) {
            const hit = intersects[0].object;
            const found = this.clickablePins.find(p => p.mesh === hit || p.mesh.parent === hit.parent);
            if (found) {
                this.focusPoint(found.id);
            }
        }
    }

    public setTrackingMode(mode: 'follow' | 'orbit'): void {
        this.trackingMode = mode;
        const btn = document.getElementById('btn-route-mode');
        if (btn) {
            btn.innerHTML = mode === 'follow' ? '<span>🔄</span> Putar Bebas' : '<span>🛵</span> Ikuti Motor';
        }
    }

    public toggleTrackingMode(): void {
        this.setTrackingMode(this.trackingMode === 'orbit' ? 'follow' : 'orbit');
    }

    public focusPoint(target: 'surabaya' | 'sidoarjo' | 'pandaan' | 'purwodadi' | 'lawang' | 'malang' | 'all'): void {
        this.trackingMode = 'orbit';
        const modeBtn = document.getElementById('btn-route-mode');
        if (modeBtn) modeBtn.innerHTML = '<span>🛵</span> Ikuti Motor';

        const infoEl = document.getElementById('route-waypoint-info');

        if (target === 'all') {
            this.targetRotX = 0.55;
            this.targetRotY = 0.35;
            this.targetZoom = 11.5;
            if (infoEl) {
                infoEl.innerHTML = `
                    <div class="flex items-center justify-between border-b border-amber-900/15 pb-1 mb-1 font-serif text-[8px] sm:text-[8.5px]">
                        <span class="font-bold text-red-950 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Rute Motor Kita: 98 KM Surabaya ↔ Malang
                        </span>
                        <span class="text-amber-900 font-bold bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-900/20 text-[7px] font-mono">Jalur Bawah</span>
                    </div>
                    <p class="m-0 text-stone-800 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-serif italic leading-snug">
                        "98 km naik motor lewat jalan arteri Surabaya - Pandaan & dinginnya tanjakan Lawang. Setiap putaran roda motor selalu terasa dekat ke pelukanmu."
                    </p>
                `;
            }
            return;
        }

        const wp = ROUTE_WAYPOINTS[target];
        if (wp) {
            this.targetRotX = wp.rotX;
            this.targetRotY = wp.rotY;
            this.targetZoom = wp.zoom;

            if (infoEl) {
                infoEl.innerHTML = `
                    <div class="flex items-center justify-between border-b border-amber-900/15 pb-1 mb-1 font-serif text-[8px] sm:text-[8.5px]">
                        <span class="font-bold text-red-950 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            ${wp.name}
                        </span>
                        <span class="text-amber-900 font-bold bg-amber-900/10 px-1.5 py-0.5 rounded border border-amber-900/20 text-[7px] font-mono">${wp.badge}</span>
                    </div>
                    <p class="m-0 text-stone-800 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-serif italic leading-snug">
                        "${wp.story}"
                    </p>
                `;
            }
        }
    }

    public onResize(): void {
        if (!this.container || !this.renderer || !this.camera) return;
        const rect = this.container.getBoundingClientRect();
        const width = Math.floor(rect.width || this.container.clientWidth);
        const height = Math.floor(rect.height || this.container.clientHeight);
        if (width <= 0 || height <= 0) return;
        if (width === this.lastWidth && height === this.lastHeight) return;

        this.lastWidth = width;
        this.lastHeight = height;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, true);
    }

    public start(): void {
        this.isActive = true;
        this.lastTime = performance.now();
        this.lastInteractionTime = performance.now();
        this.onResize();

        // Staggered resize updates to guarantee crisp rendering as page layout finishes animating
        setTimeout(() => this.onResize(), 80);
        setTimeout(() => this.onResize(), 280);

        if (this.animFrameId === null) {
            this.tick();
        }
    }

    public stop(): void {
        this.isActive = false;
        if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    private tick = (): void => {
        if (!this.isActive) return;

        const now = performance.now();
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        // Loop progress along the 98 km motorcycle route
        this.routeProgress = (this.routeProgress + delta * 0.085) % 1.0;

        if (this.curve) {
            const point = this.curve.getPointAt(this.routeProgress);
            const tangent = this.curve.getTangentAt(this.routeProgress).normalize();

            // Traveling motorcycle vehicle
            if (this.travelingMotor) {
                this.travelingMotor.position.copy(point);
                this.travelingMotor.position.y += 0.05 + Math.sin(now * 0.008) * 0.02; // Gentle road vibration
                this.travelingMotor.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
            }

            // Glowing pulse ahead
            if (this.pulseMesh) {
                const pulseT = (this.routeProgress + 0.04) % 1.0;
                this.pulseMesh.position.copy(this.curve.getPointAt(pulseT));
                this.pulseMesh.position.y += 0.1;
            }

            // Camera handling
            if (this.camera) {
                if (this.trackingMode === 'follow') {
                    // Smooth chase cam behind motorcycle rider
                    const chaseOffset = tangent.clone().multiplyScalar(-2.4).add(new THREE.Vector3(0, 1.4, 0));
                    const idealCamPos = point.clone().add(chaseOffset);
                    const lookAheadPoint = point.clone().add(tangent.clone().multiplyScalar(1.5));

                    this.camera.position.lerp(idealCamPos, 0.06);
                    this.camera.lookAt(lookAheadPoint);
                } else {
                    // Free Orbit + Mouse Parallax tracking with buttery smooth damping
                    if (!this.isDragging && !this.isPinching && (now - this.lastInteractionTime > 2500)) {
                        // Gentle ambient auto-rotation resumes only after user stops interacting
                        this.targetRotY += 0.0004;
                    }

                    this.currentRotX += (this.targetRotX - this.currentRotX) * 0.07;
                    this.currentRotY += (this.targetRotY - this.currentRotY) * 0.07;
                    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.07;

                    const effectiveRotX = this.currentRotX + this.mouseParallaxY;
                    const effectiveRotY = this.currentRotY + this.mouseParallaxX;

                    const radius = this.currentZoom;
                    const cx = radius * Math.sin(effectiveRotY) * Math.cos(effectiveRotX);
                    const cy = radius * Math.sin(effectiveRotX);
                    const cz = radius * Math.cos(effectiveRotY) * Math.cos(effectiveRotX);

                    this.camera.position.set(cx, cy, cz);
                    this.camera.lookAt(0, 0.32, 0);
                }
            }
        }

        // Live Mileage HUD update
        const kmEl = document.getElementById('route-live-km');
        if (kmEl) {
            const currentKm = Math.round(this.routeProgress * 98);
            kmEl.textContent = `${currentKm} / 98 km`;
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        this.animFrameId = requestAnimationFrame(this.tick);
    };

    public dispose(): void {
        this.stop();
        if (this.resizeRafId !== null) {
            cancelAnimationFrame(this.resizeRafId);
            this.resizeRafId = null;
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.canvas && this.canvas.parentElement) {
                this.canvas.parentElement.removeChild(this.canvas);
            }
        }
        if (this.scene) {
            this.scene.traverse((obj) => {
                if (obj instanceof THREE.Mesh) {
                    obj.geometry.dispose();
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((m) => m.dispose());
                    } else if (obj.material) {
                        obj.material.dispose();
                    }
                }
            });
        }
    }
}
