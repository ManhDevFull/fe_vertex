import { Modal, ModalBody } from "../ui/modal";

export default function ChooseModule(props: {
  text: string;
  open: boolean;
  onClose: () => void;
  onYes: () => void;
  styleYes: string
}) {
  const { onClose, text, onYes, open, styleYes } = props;

    if(!open) return null;
  return (
    <Modal
      open={open}
      onClose={() => onClose?.()}
      variant="centered"
      size="md"
      showOverlay
      showCloseButton={false}
    >
      <ModalBody>
        <div className="text-center font-medium">{text}</div>
        <div className="flex justify-between mt-4">
          <button className="w-[48%] py-2 rounded-lg shadow flex items-center justify-center outline-none bg-[#f0f0f0]" onClick={()=>onClose?.()}>Cancel</button>
          <button className={`w-[48%] py-2 rounded-lg shadow flex items-center justify-center outline-none ${styleYes}`} onClick={()=>{onYes?.()}}>Yes</button>
        </div>
      </ModalBody>
    </Modal>
  );
}
