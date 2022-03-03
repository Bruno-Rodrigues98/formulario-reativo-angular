import { HttpClient } from '@angular/common/http';
import { compileComponentFromMetadata, ThisReceiver } from '@angular/compiler';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.css']
})
export class DataFormComponent implements OnInit {

  formulario: FormGroup;


  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
    ) { }

  ngOnInit(): void {

    /*this.formulario = new FormGroup({
      nome: new FormControl(null),
      email: new FormControl(null)
    })*/

    this.formulario = this.formBuilder.group({
      nome: [null, Validators.required],
      email: [null, Validators.required, Validators.email],

      endereco: this.formBuilder.group({
        cep: [null, Validators.required],
        numero: [null, Validators.required],
        complemento: [null, Validators.required],
        rua: [null, Validators.required],
        bairro: [null, Validators.required],
        cidade: [null, Validators.required],
        estado: [null, Validators.required],
      }),

      newsletter: [null]

    })
  }

  onSubmit(){
    console.log(this.formulario.value);

    if(this.formulario.valid){

      this.http.post('https://httpbin.org/post', JSON.stringify(this.formulario.value))
      .subscribe(dados => {
      console.log(dados);
      //reseta formulário
      //this.formulario.reset();
    },
    (error: any) => alert('erro'))
    }else{
      console.log("FORMULÁRIO INVALIDO");
      this.vericaValidacoesForm(this.formulario)
    }

  }

  vericaValidacoesForm(formGroup: FormGroup){
      Object.keys(formGroup.controls).forEach(campo => {
      console.log(campo);
      const controle = formGroup.get(campo);
      controle?.markAsDirty
      if(controle instanceof FormGroup){
        this.vericaValidacoesForm(controle)
      }
    })

  }


  resetar(){
    this.formulario.reset();
  }

  verificaValidTouched(campo: any){
    return !this.formulario.get(campo)?.valid && !!this.formulario.get(campo)?.touched;
  }

  aplicaCssErro(campo: any) {
    return {
      'has-error': this.verificaValidTouched(campo),
      'has-feedback': this.verificaValidTouched(campo)
    };
  }

  consultaCEP() {

    let cep = this.formulario.get('endereco.cep')?.value;
    cep = cep.replace(/\D/g, '');

    /*if (cep != null && cep !== '') {
      this.cepService.consultaCEP(cep)
      .subscribe(dados => this.populaDadosForm(dados, form));
    }*/

    this.http.get(`//viacep.com.br/ws/${cep}/json/`)
    .subscribe(dados => this.populaDadosForm(dados));

  }

   populaDadosForm(dados: any) {
    // this.formulario.setValue({});

    this.formulario.patchValue({
      endereco: {
        rua: dados.logradouro,
        // cep: dados.cep,
        complemento: dados.complemento,
        bairro: dados.bairro,
        cidade: dados.localidade,
        estado: dados.uf
      }
    });

    // console.log(form);
  }

  resetaDadosForm() {
    this.formulario.patchValue({
      endereco: {
        rua: null,
        complemento: null,
        bairro: null,
        cidade: null,
        estado: null
      }
    });
  }


}
