import { Form, Button, View } from "@tarojs/components";
import "./index.scss";

function QcFormId(props: { onGetFormId: Function; children: JSX.Element }) {
  function getFormId(e: any) {
    props.onGetFormId(e.target.formId);
  }
  return (
    <Form className="hidden-form" reportSubmit onSubmit={getFormId}>
      <View>{props.children}</View>
      <Button className="hidden-button" formType="submit"></Button>
    </Form>
  );
}

export default QcFormId;
