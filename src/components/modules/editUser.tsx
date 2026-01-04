import { IUser } from "@/types/type";
import { Modal, ModalBody, ModalHeader } from "../ui/modal";

export default function EditUser(props: {
  visible: boolean;
  user: IUser | null;
  onClose: () => void;
}) {
  const { visible, onClose, user } = props;

  if (!visible) return null;
  return (
    <Modal
      open={visible}
      onClose={() => onClose?.()}
      variant="centered"
      size="md"
      showOverlay
      showCloseButton
    >
      <ModalHeader>
        <h2 className="text-lg font-semibold">Edit Info User</h2>
      </ModalHeader>
      <ModalBody>
        {user ? (
          <div>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Orders:</strong> {user.orders}
            </p>
          </div>
        ) : (
          <p>No user selected</p>
        )}
      </ModalBody>
    </Modal>
  );
}
