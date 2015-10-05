declare module 'color-picker' {
  import $ from 'jquery';
  export class ColorPicker {
    constructor();
    fillRGBAFields(hsba: any, cal: any): any;
    fillHSBAFields(hsba: any, cal: any): any;
    fillHexFields(hsba: any, cal: any): any;
    setSelector(hsba: any, cal: any): any;
    setHue(hsba: any, cal: any): any;
    setAlpha(hsba: any, cal: any): any;
    setCurrentColor(hsba: any, cal: any): any;
    setNewColor(hsba: any, cal: any): any;
    keyDown(ev: any): any;
    change(ev: any): any;
    blur(ev: any): any;
    focus(): any;
    downIncrement(ev: any): any;
    moveIncrement(ev: any): any;
    upIncrement(ev: any): any;
    downHue(ev: any): any;
    moveHue(ev: any): any;
    upHue(ev: any): any;
    downAlpha(ev: any): any;
    moveAlpha(ev: any): any;
    upAlpha(ev: any): any;
    downSelector(ev: any): any;
    moveSelector(ev: any): any;
    upSelector(ev: any): any;
    enterSubmit(ev: any): any;
    leaveSubmit(ev: any): any;
    clickSubmit(ev: any): any;
    show(ev: any): any;
    hide(ev: any): any;
    isChildOf(parentEl: any, el: any, container: any): any;
    getViewport(): any;
    fixHSBA(hsba: any): any;
    fixRGBA(rgba: any): any;
    fixHex(hex: any): any;
    HexToRGBA(hex: any): any;
    HexToHSBA(hex: any): any;
    RGBAToHSBA(rgba: any): any;
    HSBAToRGBA(hsba: any): any;
    RGBAToHex(rgba: any): any;
    HSBAToHex(hsba: any): any;
    HSBAToCSSRGBA(hsba: any): any;
    restoreOriginal(): any;
  }
}