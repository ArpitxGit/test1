import { Field, SmartContract, state, State, method, Circuit } from 'snarkyjs';

export class ZusK extends SmartContract {
  @state(Field) result = State<Field>();

  @method initState(salt: Field) {
    this.result.set(Field(0));
  }

  @method verifyAge(salt: Field, age: Field) {
    const ageThreshold = Field(18);
    const isValid = age.gte(ageThreshold);

    this.result.set(Circuit.if(isValid, Field(1), Field(0)));
  }
}
