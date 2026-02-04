"use client";

import { Modal, Button } from "antd";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import TDForm from "@/src/components/form/TDForm";
import TDInput from "@/src/components/form/TDInput";
import TDSelect from "@/src/components/form/TDSelect";
import { categoryValidation } from "../../Validation/categoryValidation";
import { statusOptions } from "@/src/utils/constant";


type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
  onSubmit: SubmitHandler<FieldValues>;
};

const UpdateCategoryModal = ({ open, selected, onClose, onSubmit }: Props) => {
  const defaultValues = selected
    ? {
        name: selected?.name ?? "",
        code: selected?.code ?? "",
        status: selected?.status ?? "active",
        description: selected?.description ?? "",
      }
    : undefined;

  return (
    <Modal
      title="Update Category"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      {selected ? (
        <div className="pt-2">
          <TDForm
            key={selected?._id || selected?.id}
            resolver={zodResolver(categoryValidation)}
            onSubmit={onSubmit}
            defaultValues={defaultValues as any}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              <TDInput label="Category Name" name="name" required />

              <TDInput
                label="Category Code"
                name="code"
                required
                placeholder="e.g. ELEC"
              />

              <TDSelect
                label="Status"
                name="status"
                options={statusOptions}
                required
              />

              <TDInput
                label="Description (Optional)"
                name="description"
                placeholder="Short description of the category"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Update Category
              </Button>
            </div>
          </TDForm>
        </div>
      ) : null}
    </Modal>
  );
};

export default UpdateCategoryModal;
