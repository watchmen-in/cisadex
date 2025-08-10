export type MapOp = (map: any) => void;

export class MapReadyQueue {
  private map: any;
  private ready = false;
  private q: MapOp[] = [];
  constructor(map: any) {
    this.map = map;
    const onReady = () => { this.ready = true; this.flush(); };
    const waitIdle = () => this.map.once("idle", onReady);
    if (this.map.isStyleLoaded?.()) waitIdle(); else this.map.once("load", waitIdle);

    // If style changes, pause and wait again
    this.map.on("styledata", () => {
      this.ready = false;
      this.map.once("idle", () => { this.ready = true; this.flush(); });
    });
  }
  run(op: MapOp) {
    if (this.ready) {
      try { op(this.map); } catch { this.q.push(op); }
    } else {
      this.q.push(op);
    }
  }
  private flush() {
    const ops = this.q.splice(0, this.q.length);
    for (const op of ops) {
      try { op(this.map); } catch (e) { /* swallow, next idle will retry if needed */ }
    }
  }
}
