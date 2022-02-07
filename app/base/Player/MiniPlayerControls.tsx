import { CONTROLS } from "./config";
import { AspectRatio, Close, VolumeOff, VolumeUp } from "./icons";

const controls = [CONTROLS.mute, CONTROLS.close, CONTROLS.resize];

const PlayerControls = (props: IProps) => {
  const { muted } = props;

  const renderControl = (control: string, key: number) => {
    let Icon;
    let callback;

    switch (control) {
      case CONTROLS.close:
        Icon = Close;
        // callback = onClose;
        break;
      case CONTROLS.mute:
        Icon = muted ? VolumeOff : VolumeUp;
        // callback = onMute;
        break;
      case CONTROLS.resize:
        Icon = AspectRatio;
        // callback = onResize;
        break;
      default:
        return null;
    }

    return (
      <button key={key} className="PlayerControls-button" onClick={callback}>
        <img src={Icon} />
      </button>
    );
  };

  return (
    <div className="PlayerControls">
      {controls.map((control: string, i: number) => renderControl(control, i))}
    </div>
  );
};

export default PlayerControls;

interface IProps {
  muted: boolean;
}
