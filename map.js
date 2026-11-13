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
    const WALL_N = 0xa3bcae, FLOOR_N = 0x7d9b8a;   // 北エリア (緑寄りの淡い色)
    const WALL_S = 0xa8b6c4, FLOOR_S = 0x7f97a3;   // 南エリア (青寄りの淡い色)

    // 矩形 (x0..x1, z0..z1) から box を作る補助関数
    const rect = (x0, x1, z0, z1, h, color, y) => ({
        x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, h: h, color: color, y: y || 0,
    });
    const ugWall = (x0, x1, z0, z1, color) => rect(x0, x1, z0, z1, UG_H, color || WALL, UG);
    const ugFloor = (x0, x1, z0, z1, color) => rect(x0, x1, z0, z1, 1, color || FLOOR, UG - 1);

    const boxes = [];
    const ramps = [];

    // 四隅の塔 (高さ3m) + 中心側から登るスロープ + 塔の上の柱
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz], i) => {
        boxes.push({ x: sx * 40, z: sz * 40, w: 12, h: 3, d: 12, color: [0xdde7ea, 0xdfead9, 0xf3e5cf, 0xe6ddf0][i] });
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
    // 北側の壁は北通路の開口 (x=8..14) を、南側の壁は南通路の開口 (x=-10..-4) を空ける
    boxes.push(ugWall(-30, 8, -4, -3));
    boxes.push(ugWall(14, 33, -4, -3));
    boxes.push(ugWall(-30, -10, 3, 4));
    boxes.push(ugWall(-4, 33, 3, 4));
    boxes.push(ugFloor(-14, 33, -3, 3));
    // 東の部屋 (はしごの出口つき)。南の壁は南連絡通路の開口 (x=34..40) を空ける
    boxes.push(ugWall(32, 48, -8, -7));
    boxes.push(ugWall(32, 34, 7, 8));
    boxes.push(ugWall(40, 48, 7, 8));
    boxes.push(ugWall(47, 48, -8, 8));
    boxes.push(ugWall(32, 33, -8, -3));
    boxes.push(ugWall(32, 33, 3, 8));
    boxes.push(ugFloor(33, 47, -7, 7));

    // 北通路 (本通路から北へ分岐) と北の部屋。北の部屋には入口Cのはしごがある
    boxes.push(ugFloor(8, 14, -19, -3, FLOOR_N));
    boxes.push(ugWall(7, 8, -19, -4, WALL_N));
    boxes.push(ugWall(14, 15, -19, -4, WALL_N));
    boxes.push(ugFloor(4, 20, -27, -19, FLOOR_N));
    boxes.push(ugWall(3, 21, -28, -27, WALL_N));
    boxes.push(ugWall(3, 4, -27, -19, WALL_N));
    boxes.push(ugWall(20, 21, -27, -19, WALL_N));
    boxes.push(ugWall(3, 8, -20, -19, WALL_N));
    boxes.push(ugWall(14, 21, -20, -19, WALL_N));
    // 北の部屋のスロープと一段高い足場 (床 -6 から -4 へ)
    ramps.push({ x: 18, z: -20, dir: [0, -1], run: 6, rise: 2, width: 3, y: UG, color: 0xd7ccc8 });
    boxes.push(rect(15, 20, -27, -25, 2, 0xbcaaa4, UG));

    // 南通路 (本通路から南へ分岐) と南回廊 (東の部屋へ戻るループ)
    boxes.push(ugFloor(-10, -4, 3, 14, FLOOR_S));
    boxes.push(ugWall(-11, -10, 4, 21, WALL_S));
    boxes.push(ugWall(-4, -3, 4, 14, WALL_S));
    boxes.push(ugFloor(-10, 40, 14, 20, FLOOR_S));
    boxes.push(ugWall(-11, 41, 20, 21, WALL_S));
    boxes.push(ugWall(-3, 34, 13, 14, WALL_S));
    // 南回廊の南側にある一段高い歩道 (床 -6 から -4.5 へ) とそのスロープ
    ramps.push({ x: 8, z: 18.5, dir: [1, 0], run: 6, rise: 1.5, width: 3, y: UG, color: 0xe6cfae });
    boxes.push(rect(14, 28, 17, 20, 1.5, 0xb0a49a, UG));
    // 東の部屋と南回廊をつなぐ連絡通路
    boxes.push(ugFloor(34, 40, 7, 14, FLOOR_S));
    boxes.push(ugWall(33, 34, 8, 14, WALL_S));
    boxes.push(ugWall(40, 41, 8, 21, WALL_S));

    window.BOXBLOX_MAP = {
        halfSize: 50,             // マップの半径 (一辺は halfSize * 2)
        undergroundY: UG,
        surfaceThickness: 2,      // 地表の厚み
        surfaceColor: 0xf5f5f5,
        surfaceHoles: [
            { x0: -30, x1: -14, z0: -3, z1: 3 },    // 入口A: 坂道
            { x0: 40, x1: 44, z0: -7, z1: -3 },     // 入口B: はしご
            { x0: 10, x1: 14, z0: -27, z1: -23 },   // 入口C: はしご (北の部屋)
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
            { x: 12, z: -27, dir: [0, -1], y0: UG, y1: 0, width: 2 },      // 地下 (北の部屋) → 地上
        ],
    };
})();
