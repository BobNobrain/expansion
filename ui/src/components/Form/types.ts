export type ValidationState =
    | {
          type: 'ok';
          explicitSuccess?: boolean;
      }
    | {
          type: 'error';
          message?: string;
      }
    | {
          type: 'loading';
      };

export type FormFieldController = {
    retrieveValue: () => unknown;
    validate: () => boolean;
};

export type FormFieldRegistrationData = {
    initialValue: unknown;
};
