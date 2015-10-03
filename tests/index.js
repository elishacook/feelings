'use strict'

var expect = require('chai').expect,
    validate = require('../lib/index.js')

describe('feelings', function ()
{
    it('returns nothing if there are no constraints', function ()
    {
        var errors = validate({}, {})
        expect(errors).to.be.null
    })
    
    it('throws an error if there is an unknown constraint', function ()
    {
        expect(
            validate.bind(null, { foo: { madeup: 123 } }, {})
        ).to.throw('Unknown constraint "madeup"')
    })
    
    it('fails if there is a data field not in the schema', function ()
    {
        var errors = validate({}, { foo: 123 })
        expect(errors.foo).to.equal('Unknown field')
    })
    
    it('fails if a required field is not present', function ()
    {
        var errors = validate({ foo: { required: true } }, {})
        expect(errors.foo).to.equal('This field is required')
    })
    
    it('passes if all required fields are present', function ()
    {
        var errors = validate(
            {
                foo: { required: true },
                bar: {}
            },
            { foo: 123 }
        )
        expect(errors).to.be.null
    })
    
    it('fails if a field does not have the right type', function ()
    {
        var errors = validate({ foo: { type: Number } }, { foo: '123' })
        expect(errors.foo).to.equal('Expected an instance of function Number() { [native code] }')
    })
    
    it('passes if a field has the right type', function ()
    {
        var errors = validate({ foo: { type: Number } }, { foo: 123 })
        expect(errors).to.be.null
    })
    
    it ('fails when one field does not pass all of its constraints', function ()
    {
        var errors = validate(
            {
                foo: { type: Number },
                bar: { type: Date }
            },
            {
                foo: 123,
                bar: 'imma date'
            }
        )
        
        expect(Object.keys(errors).length).to.equal(1)
        expect(errors.bar).to.equal('Expected an instance of function Date() { [native code] }')
    })
    
    it('passes when all fields pass their constraints', function ()
    {
        var errors = validate(
            {
                foo: { type: Number },
                bar: { type: Date }
            },
            {
                foo: 123,
                bar: Date.now()
            }
        )
        
        expect(errors).to.equal.null
    })
    
    it('fails if a value is less than min', function ()
    {
        var errors = validate({ foo: { min: 10 } }, { foo: 5 })
        expect(errors.foo).to.equal('Must be greater than or equal to 10')
    })
    
    it('passes if a value is greater than min', function ()
    {
        var errors = validate({ foo: { min: 10 } }, { foo: 15 })
        expect(errors).to.be.null
    })
    
    it('passes if a value is equal to min', function ()
    {
        var errors = validate({ foo: { min: 10 } }, { foo: 10 })
        expect(errors).to.be.null
    })
    
    it('fails if a value is greater than max', function ()
    {
        var errors = validate({ foo: { max: 10 } }, { foo: 11 })
        expect(errors.foo).to.equal('Must be less than or equal to 10')
    })
    
    it('passes if a value is less than max', function ()
    {
        var errors = validate({ foo: { max: 10 } }, { foo: 9 })
        expect(errors).to.be.null
    })
    
    it('passes if a value is equal to max', function ()
    {
        var errors = validate({ foo: { max: 10 } }, { foo: 10 })
        expect(errors).to.be.null
    })
    
    it('fails if a value\'s length is shorter than min_length', function ()
    {
        var errors = validate({ foo: { min_length: 10 } }, { foo: '12345' })
        expect(errors.foo).to.equal('Must be longer than or equal to 10')
    })
    
    it('passes if a value\'s length is longer than min_length', function ()
    {
        var errors = validate({ foo: { min_length: 10 } }, { foo: '123456789012345' })
        expect(errors).to.be.null
    })
    
    it('passes if a value\'s length is equal to min_length', function ()
    {
        var errors = validate({ foo: { min_length: 10 } }, { foo: '1234567890' })
        expect(errors).to.be.null
    })
    
    it('fails if a value\'s length is longer than max_length', function ()
    {
        var errors = validate({ foo: { max_length: 10 } }, { foo: '12345678901' })
        expect(errors.foo).to.equal('Must be shorter than or equal to 10')
    })
    
    it('passes if a value\'s length is shorter than max_length', function ()
    {
        var errors = validate({ foo: { max_length: 10 } }, { foo: '123456789' })
        expect(errors).to.be.null
    })
    
    it('passes if a value\'s length is equal to max_length', function ()
    {
        var errors = validate({ foo: { max_length: 10 } }, { foo: '1234567890' })
        expect(errors).to.be.null
    })
    
    it('fails if a value does not match a pattern', function ()
    {
        var errors = validate({ foo: { matches: /^abc/ } }, { foo: 'bcd' })
        expect(errors.foo).to.equal('Must match pattern /^abc/')
    })
    
    it('passes if a value matches the pattern', function ()
    {
        var errors = validate({ foo: { matches: /^abc/ } }, { foo: 'abcrabadabba' })
        expect(errors).to.be.null
    })
    
    it('fails if the items in an array don\'t match the item schema', function ()
    {
        var errors = validate(
            {
                foo: {
                    items: {
                        type: String
                    }
                }
            },
            {
                foo: [ '1', 2, '3' ]
            }
        )
        
        expect(errors.foo).to.equal('Expected an instance of function String() { [native code] }')
    })
    
    it('passes if the items in an array all match the item schema', function ()
    {
        var errors = validate(
            {
                foo: {
                    items: {
                        type: String
                    }
                }
            },
            {
                foo: [ '1', '2', '3' ]
            }
        )
        expect(errors).to.be.null
    })
    
    it('fails if a field does not match its schema', function ()
    {
        var errors = validate(
        {
            foo: {
                schema: {
                    bar: {
                        type: Array
                    }
                }
            }
        },
        {
            foo: {
                bar: '1 2 3'
            }
        })
        
        expect(errors.foo).to.deep.equal({ bar: 'Expected an instance of function Array() { [native code] }' })
    })
    
    it('passes if a field matches its schema', function ()
    {
        var errors = validate(
        {
            foo: {
                schema: {
                    bar: {
                        type: Array
                    }
                }
            }
        },
        {
            foo: {
                bar: [1,2,3]
            }
        })
        
        expect(errors).to.be.null
    })
})