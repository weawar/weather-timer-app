import { useState } from 'react'
import Modal from './Modal'

function ModalButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button className="show-widget-btn modal-btn" onClick={() => setIsOpen(true)}>
        Open Modal
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="modal-content-custom">
          <h3>Модальное окно</h3>
          <p>Это пример содержимого модального окна.</p>
          <p>Вы можете добавить сюда любую информацию.</p>
        </div>
      </Modal>
    </>
  )
}

export default ModalButton