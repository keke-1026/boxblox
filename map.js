// boxblox マップデータ
// ここを編集するとマップの形を変えられます (index.html は触らなくてOK)。
// 全員が同じデータからマップを作るので、サーバーとの同期は不要です。
//
// 単位はメートル。(x, z) が水平位置、y が高さ。地表の高さは y = 0。
//   boxes   : 直方体。(x, z)=中心 / w=X方向の幅 / h=高さ / d=Z方向の奥行き / y=底面の高さ(省略で0)
//   ramps   : スロープ。(x, z)=登り口(下り口)の位置 / dir=進む向き [x, z] (軸方向のみ) /
//             run=水平距離 / rise=高さの変化 (マイナスで下り坂) / width=幅 / y=開始の高さ(省略で0)
//   ladders : はしご。(x, z)=壁の面の中心 / dir=プレイヤーが壁へ向かう向き [x, z] /
//             y0=下端の高さ / y1=上端の高さ(この高さの足場へ乗り移れる) / width=幅
//   surfaceHoles : 地表(地面)に開ける穴。地下への入口に使う
(function () {
    const UG = -6;       // 地下の床の高さ
    const UG_H = 4;      // 地下通路の高さ (床 -6 〜 天井 -2)
    const STONE = 0xb0bec5, WALL = 0x90a4ae, FLOOR = 0x78909c;

    // 矩形 (x0..x1, z0..z1) から box を作る補助関数
    const rect = (x0, x1, z0, z1, h, color, y) => ({
        x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, h: h, color: color, y: y || 0,
    });
    const ugWall = (x0, x1, z0, z1) => rect(x0, x1, z0, z1, UG_H, WALL, UG);
    const ugFloor = (x0, x1, z0, z1) => rect(x0, x1, z0, z1, 1, FLOOR, UG - 1);

    const boxes = [];
    const ramps = [];

    // 四隅の塔 (高さ3m) + 中心側から登るスロープ + 塔の上の柱
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
        boxes.push({ x: sx * 40, z: sz * 40, w: 12, h: 3, d: 12, color: 0xcfd8dc });
        ramps.push({ x: sx * 25, z: sz * 40, dir: [sx, 0], run: 9, rise: 3, width: 4, color: 0xffe0b2 });
        boxes.push({ x: sx * 42, z: sz * 42, w: 2, h: 5, d: 2, color: STONE });
    });

    // 北側の階段 (ジャンプで登る。1段1.2m)
    boxes.push({ x: 0, z: -14, w: 8, h: 1.2, d: 4, color: 0xc5e1a5 });
    boxes.push({ x: 0, z: -18, w: 8, h: 2.4, d: 4, color: 0xaed581 });
    boxes.push({ x: 0, z: -24, w: 8, h: 3.6, d: 8, color: 0x9ccc65 });

    // 高い塔 (はしごで登る)
    boxes.push({ x: -28, z: -28, w: 6, h: 16, d: 6, color: 0xb39ddb });   // 16m
    boxes.push({ x: 28, z: -28, w: 6, h: 12, d: 6, color: 0xce93d8 });    // 12m
    boxes.push({ x: 26, z: 26, w: 8, h: 8, d: 8, color: 0x80cbc4 });      // 8m の展望台

    // 柱 (8m。はしごで登れる)
    boxes.push({ x: 20, z: 12, w: 2, h: 8, d: 2, color: STONE });
    boxes.push({ x: -20, z: 12, w: 2, h: 8, d: 2, color: STONE });
    boxes.push({ x: 0, z: 22, w: 2, h: 8, d: 2, color: STONE });

    // 南側の低い壁パネル (遮蔽物)
    boxes.push({ x: -8, z: 28, w: 10, h: 2, d: 1, color: 0x90caf9 });
    boxes.push({ x: 8, z: 28, w: 10, h: 2, d: 1, color: 0x90caf9 });

    // ===== 地下 =====
    // 入口A: 西の地表から下る坂道 (x=-30 → -14 で 6m 下る)
    ramps.push({ x: -30, z: 0, dir: [1, 0], run: 16, rise: -6, width: 6, y: 0, color: 0xffcc80 });
    // 地下通路 (東西に長い通路)。坂道の横の壁もここに含む
    boxes.push(ugWall(-30, 33, -4, -3));
    boxes.push(ugWall(-30, 33, 3, 4));
    boxes.push(ugFloor(-14, 33, -3, 3));
    // 東の部屋 (はしごの出口つき)
    boxes.push(ugWall(32, 48, -8, -7));
    boxes.push(ugWall(32, 48, 7, 8));
    boxes.push(ugWall(47, 48, -8, 8));
    boxes.push(ugWall(32, 33, -8, -3));
    boxes.push(ugWall(32, 33, 3, 8));
    boxes.push(ugFloor(33, 47, -7, 7));

    window.BOXBLOX_MAP = {
        halfSize: 50,             // マップの半径 (一辺は halfSize * 2)
        undergroundY: UG,
        surfaceThickness: 2,      // 地表の厚み
        surfaceColor: 0xf5f5f5,
        surfaceHoles: [
            { x0: -30, x1: -14, z0: -3, z1: 3 },    // 入口A: 坂道
            { x0: 40, x1: 44, z0: -7, z1: -3 },     // 入口B: はしご
        ],
        boxes: boxes,
        ramps: ramps,
        ladders: [
            { x: -25, z: -28, dir: [-1, 0], y0: 0, y1: 16, width: 1.6 },   // 16mの塔
            { x: 25, z: -28, dir: [1, 0], y0: 0, y1: 12, width: 1.6 },     // 12mの塔
            { x: 22, z: 26, dir: [1, 0], y0: 0, y1: 8, width: 1.6 },       // 展望台
            { x: 19, z: 12, dir: [1, 0], y0: 0, y1: 8, width: 1.4 },       // 柱
            { x: -19, z: 12, dir: [-1, 0], y0: 0, y1: 8, width: 1.4 },     // 柱
            { x: 42, z: -7, dir: [0, -1], y0: UG, y1: 0, width: 2 },       // 地下 → 地上
        ],
    };
})();
